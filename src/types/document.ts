export interface DocumentEntity {
  id: number;
  title: string;
  sender: string;
  fileName: string;
  filePath: string; // Relativer lokaler Pfad zur .enc Datei (z.B. "vault/docs/101.enc")
  fileChecksum?: string; // SHA-256
  sha256?: string; // Rückwärtskompatibilität
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  pageCount?: number;
  colorMode?: string;
  mainCategoryId: string;
  mainCategory: string;
  subCategoryId?: string;
  subCategory: string;
  documentDate?: number; // Timestamp
  documentDateFormatted?: string;
  createdAt?: number; // Timestamp
  updatedAt?: number;
  tags?: string;
  ocrText?: string;
  previewImageUrl?: string;
  isEncrypted?: boolean;
  encryptionAlgorithm?: string; // "AES-256-GCM"
  encryptionIv?: string;
  encryptionTag?: string;
  isSynced?: boolean;
  syncTimestamp?: number;
  amount?: number | null;
  currency?: string;
  contractEndDate?: number | null;
  cancellationDeadline?: number | null;
  ocrConfidence?: number | null;
  taxDeductible?: boolean;
  sourceDevice?: string;
  docType?: string;
  status?: string;
  isDeleted?: boolean;
  deletedAt?: number | null;
}

export type ActiveMainView = 'vault' | 'scanner';
export type ActiveTab = 'vault' | 'scanner' | 'pairing' | 'settings';
export type OSWindowStyle = 'windows' | 'macos' | 'linux';

export interface PairedDevice {
  id: string;
  name: string;
  model?: string;
  osVersion?: string;
  platform?: 'android' | 'ios';
  deviceFingerprint?: string;
  pairedAt: number;
  lastSyncTime: number | null;
  status: 'connected' | 'offline' | 'error';
  ipAddress: string;
  port: number;
  protocolVersion?: string;
  certFingerprint?: string;
  ecdhPublicKeyFingerprint?: string;
  mTLSCertificateExpiry?: string | number;
}

export interface VaultSecurityConfig {
  isUnlocked: boolean;
  
  // App Access Authorization
  appAuthMethod: 'os_system' | 'pin' | 'none'; // OS-Login (Windows Hello / TouchID), PIN, oder Deaktiviert
  hasPin?: boolean;
  pinCode: string;
  autoLockMinutes: number; // 0 = disabled, 1, 5, 15, 30
  
  // Document Decryption & Key Management
  decryptionMode: 'app_start' | 'on_demand' | 'os_startup';
  // 'app_start' = Standard: Beim Start der App via sicher hinterlegtem Master-Key
  // 'on_demand' = High-Secure: Jedes Dokument muss einzeln entschlüsselt werden
  // 'os_startup' = Auto-Entschlüsselung beim Systemstart (mit Sicherheitswarnung)
  
  hasMasterKey: boolean;
  masterKeyHint?: string;
  
  // Storage & Export
  exportDirectory: string;
  
  // System metadata
  lastActivityTimestamp: number;
  sqlCipherVersion: string;
  fileEncryptionAlgorithm: string;
}

export interface ScanPage {
  id: string;
  pageNumber: number;
  rotation: number;
  dpi: number;
  colorMode: 'color' | 'grayscale' | 'bw';
  detectedDocumentType?: string;
  extractedTitleHint?: string;
}

export interface ScannerHardwareDevice {
  id: string;
  name: string;
  connectionType: 'USB 3.0' | 'Wi-Fi 6' | 'Ethernet LAN';
  protocol: 'WIA 2.0' | 'SANE' | 'eSCL (AirScan)';
  supportsAdf: boolean;
  supportsDuplex: boolean;
  maxDpi: number;
}
