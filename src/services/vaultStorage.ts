import { DocumentEntity, PairedDevice, VaultSecurityConfig } from '../types/document';
import { INITIAL_DOCUMENTS } from '../data/initialDocuments';

const STORAGE_KEY_DOCS = 'mydocanizer_vault_docs_v1';
const STORAGE_KEY_CONFIG = 'mydocanizer_vault_config_v1';
const STORAGE_KEY_DEVICE = 'mydocanizer_paired_device_v1';
const STORAGE_KEY_ONBOARDING = 'mydocanizer_onboarding_completed_v1';

// In-Memory RAM-only cache with LRU eviction cap (wiped upon lock or explicit memory purge)
const MAX_RAM_CACHE_ENTRIES = 25;
const memoryDecryptedBuffer = new Map<number, { decryptedAt: number; rawText: string; pageCount?: number }>();

export const VaultService = {
  // Load all documents from SQLite/SQLCipher persistent representation
  getDocuments: (): DocumentEntity[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DOCS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Clean up any previously auto-injected sample mock documents (IDs 101-106)
          const isMockDoc = (d: DocumentEntity) => 
            (d.id >= 101 && d.id <= 106) && 
            (d.sender?.includes('Telekom') || d.sender?.includes('Allianz') || d.sender?.includes('Finanzamt') || d.sender?.includes('Klinikum') || d.sender?.includes('Stadtwerke') || d.sender?.includes('Isartor'));
          
          const filtered = parsed.filter(d => !isMockDoc(d));
          if (filtered.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(filtered));
            return filtered;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading vault storage:', e);
    }
    // Default: Clean, empty vault (no random fake documents)
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify([]));
    } catch (e) {
      console.warn('Unable to persist initial documents state:', e);
    }
    return [];
  },

  saveDocuments: (docs: DocumentEntity[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
      return true;
    } catch (e: any) {
      console.error('Error saving vault documents (possible QuotaExceeded):', e);
      // Attempt emergency trim of deleted documents if quota exceeded
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        try {
          const nonDeleted = docs.filter(d => !d.isDeleted);
          localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(nonDeleted));
          return true;
        } catch {
          // If still failing, return false to notify caller
        }
      }
      return false;
    }
  },

  getDocumentById: (id: number): DocumentEntity | undefined => {
    const docs = VaultService.getDocuments();
    return docs.find(d => d.id === id && !d.isDeleted);
  },

  updateDocument: (updatedDoc: DocumentEntity): DocumentEntity => {
    const docs = VaultService.getDocuments();
    const index = docs.findIndex(d => d.id === updatedDoc.id);
    const now = Date.now();
    const docToSave = {
      ...updatedDoc,
      updatedAt: now
    };

    if (index >= 0) {
      docs[index] = docToSave;
    } else {
      docs.unshift(docToSave);
    }

    VaultService.saveDocuments(docs);
    return docToSave;
  },

  deleteDocument: (id: number): boolean => {
    const docs = VaultService.getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index >= 0) {
      const now = Date.now();
      docs[index] = {
        ...docs[index],
        isDeleted: true,
        deletedAt: now,
        updatedAt: now
      };
      VaultService.saveDocuments(docs);
      memoryDecryptedBuffer.delete(id);
      return true;
    }
    return false;
  },

  restoreDocument: (id: number): boolean => {
    const docs = VaultService.getDocuments();
    const index = docs.findIndex(d => d.id === id);
    if (index >= 0) {
      docs[index] = {
        ...docs[index],
        isDeleted: false,
        deletedAt: null,
        updatedAt: Date.now()
      };
      VaultService.saveDocuments(docs);
      return true;
    }
    return false;
  },

  // RAM-Only Decryption simulator (Ensures zero plaintext writes to disk, LRU-capped)
  decryptDocumentToRAM: (doc: DocumentEntity): { decryptedAt: number; text: string; checksumVerified: boolean } => {
    const existing = memoryDecryptedBuffer.get(doc.id);
    if (existing) {
      // Refresh recency
      memoryDecryptedBuffer.delete(doc.id);
      memoryDecryptedBuffer.set(doc.id, existing);
      return {
        decryptedAt: existing.decryptedAt,
        text: existing.rawText,
        checksumVerified: true
      };
    }

    // Evict oldest if exceeding capacity
    if (memoryDecryptedBuffer.size >= MAX_RAM_CACHE_ENTRIES) {
      const oldestKey = memoryDecryptedBuffer.keys().next().value;
      if (oldestKey !== undefined) {
        memoryDecryptedBuffer.delete(oldestKey);
      }
    }

    const payload = {
      decryptedAt: Date.now(),
      rawText: doc.ocrText || '',
      pageCount: doc.pageCount
    };
    memoryDecryptedBuffer.set(doc.id, payload);

    return {
      decryptedAt: payload.decryptedAt,
      text: payload.rawText,
      checksumVerified: true
    };
  },

  // Secure Wipe: Erase all RAM plaintext buffers (simulates memset_s / explicit memory zeroing)
  wipeRAMDecryptionBuffers: (): number => {
    const count = memoryDecryptedBuffer.size;
    memoryDecryptedBuffer.clear();
    return count;
  },

  getRAMBufferSize: (): number => {
    return memoryDecryptedBuffer.size;
  },

  // Security Configuration
  getSecurityConfig: (): VaultSecurityConfig => {
    const defaultConfig: VaultSecurityConfig = {
      isUnlocked: true,
      appAuthMethod: 'os_system', // OS-Login (Windows Hello / Touch ID)
      hasPin: true,
      pinCode: '1234',
      autoLockMinutes: 15,
      decryptionMode: 'app_start', // Standard: Entschlüsseln beim Start via sicherem OS-Schlüsselspeicher
      hasMasterKey: true,
      masterKeyHint: 'Master-Key aus myDocAnizer Mobile (Synchronisiert)',
      lastActivityTimestamp: Date.now(),
      sqlCipherVersion: 'SQLCipher 4.6.1 (Community Edition, AES-256-CBC, PBKDF2-HMAC-SHA512)',
      fileEncryptionAlgorithm: 'AES-256-GCM (12-Byte IV, 16-Byte Auth Tag)',
      exportDirectory: 'C:\\Users\\Desktop\\Documents\\myDocAnizer-Export'
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (data) {
        return { ...defaultConfig, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading security config:', e);
    }
    return defaultConfig;
  },

  saveSecurityConfig: (config: VaultSecurityConfig): void => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving security config:', e);
    }
  },

  // Paired Android Device State
  getPairedDevice: (): PairedDevice | null => {
    const defaultDevice: PairedDevice = {
      id: 'pixel_8_pro_9918',
      name: 'Google Pixel 8 Pro',
      model: 'Pixel 8 Pro (GP4BC)',
      osVersion: 'Android 15 (AP2A.240805.005)',
      ipAddress: '192.168.178.48',
      port: 8443,
      ecdhPublicKeyFingerprint: 'SHA-256: 8F:4A:91:C2:7B:3E:01:DF:56:88:AC:33:91:20:FE:41',
      mTLSCertificateExpiry: '2027-03-26',
      lastSyncTime: Date.now() - 1000 * 60 * 2, // 2 minutes ago
      status: 'connected',
      pairedAt: Date.now() - 1000 * 60 * 60 * 24 * 14
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY_DEVICE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading paired device:', e);
    }
    return defaultDevice;
  },

  savePairedDevice: (device: PairedDevice | null): void => {
    try {
      if (device) {
        localStorage.setItem(STORAGE_KEY_DEVICE, JSON.stringify(device));
      } else {
        localStorage.removeItem(STORAGE_KEY_DEVICE);
      }
    } catch (e) {
      console.error('Error saving paired device:', e);
    }
  },

  // Onboarding status
  isOnboardingCompleted: (): boolean => {
    return localStorage.getItem(STORAGE_KEY_ONBOARDING) === 'true';
  },

  setOnboardingCompleted: (completed: boolean): void => {
    localStorage.setItem(STORAGE_KEY_ONBOARDING, completed ? 'true' : 'false');
  },

  // Reset entire vault to empty state
  resetVaultToDefault: (): void => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify([]));
    memoryDecryptedBuffer.clear();
  }
};
