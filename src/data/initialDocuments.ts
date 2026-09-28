import { DocumentEntity } from '../types/document';

export const INITIAL_DOCUMENTS: DocumentEntity[] = [
  {
    id: 101,
    title: "Telekom Festnetz & Glasfaser Monatsabrechnung",
    sender: "Telekom Deutschland GmbH",
    fileName: "Rechnung_Telekom_03_2026.pdf",
    filePath: "vault/docs/101.enc",
    fileChecksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    mainCategory: "Verträge",
    subCategory: "Telekommunikation",
    mainCategoryId: "cat_contracts",
    subCategoryId: "sub_telecom",
    docType: "Rechnung",
    tags: "Internet, Glasfaser, Telekom, Monatlich, HomeOffice",
    ocrText: `Telekom Deutschland GmbH · Landgrabenweg 151 · 53227 Bonn
Herr Max Mustermann
Maximilianstraße 42
80539 München

RECHNUNG
Rechnungsnummer: 49821049281
Rechnungsdatum: 02.03.2026
Kundenkonto: 8291048192
Vertragsnummer: MAGENTA-XL-8812

Ihre monatlichen Entgelte (Abrechnungszeitraum 01.02.2026 - 28.02.2026):
- MagentaZuhause XL (Fiber 250/50 MBit/s)               39,95 €
- Routermiete Speedport Smart 4 Plus                     4,95 €
- TV Flat Paket HD Option                                5,05 €
----------------------------------------------------------------
Nettobetrag                                             42,02 €
Umsatzsteuer 19 %                                        7,93 €
----------------------------------------------------------------
GESAMTBETRAG                                            49,95 €

Der Betrag wird zum 16.03.2026 von Ihrem Bankkonto DE89 7008 0000 0123 4567 89 per SEPA-Basislastschrift eingezogen.`,
    colorMode: "Farbe",
    pageCount: 2,
    fileSizeFormatted: "342 KB",
    amount: 49.95,
    contractEndDate: 1774915200000, // 2026-03-31
    cancellationDeadline: 1772409600000, // 2026-03-01
    createdAt: 1740992400000, // 2025-03-03
    updatedAt: 1740992400000,
    isDeleted: false,
    deletedAt: null,
    encryptionIv: "a4f891b2c3d4e5f60718293a",
    encryptionTag: "9f8e7d6c5b4a39281706f5e4d3c2b1a0"
  },
  {
    id: 102,
    title: "Kfz-Haftpflicht & Vollkasko Beitragsrechnung 2026",
    sender: "Allianz Versicherungs-AG",
    fileName: "Allianz_Kfz_Police_2026.pdf",
    filePath: "vault/docs/102.enc",
    fileChecksum: "c795123d4218b32943ecfa1284a1e582847291a18247921a84fbe1938fbc1829",
    mainCategory: "Versicherungen",
    subCategory: "Kfz-Versicherung",
    mainCategoryId: "cat_insurance",
    subCategoryId: "sub_car_insurance",
    docType: "Versicherungsschein",
    tags: "Auto, Allianz, Vollkasko, BMW i4, Jahresbeitrag, SF-Klasse 14",
    ocrText: `Allianz Versicherungs-AG · Königinstraße 28 · 80802 München
Versicherungsschein für die Kraftfahrtversicherung
Versicherungsnummer: AZ-KFZ-9821094-B
Amtliches Kennzeichen: M-MD 2026E
Fahrzeug: BMW i4 eDrive40 Gran Coupé

Sehr geehrter Herr Mustermann,
wir bestätigen Ihren Versicherungsschutz für den Zeitraum 01.01.2026 bis 31.12.2026:

1. Kfz-Haftpflichtversicherung (100 Mio. € pauschal)
   Schadenfreiheitsklasse SF 14 (Beitragssatz 31%)         214,30 €
2. Vollkaskoversicherung (500 € SB inkl. Teilkasko 150 € SB)
   Schadenfreiheitsklasse SF 14 (Beitragssatz 34%)         271,90 €
----------------------------------------------------------------
Jahresgesamtbeitrag inkl. 19% VersSt.                    486,20 €

Kündigungsfrist: 1 Monat zum Ablauf des Versicherungsjahres (Stichtag: 30.11.2026).`,
    colorMode: "Farbe",
    pageCount: 4,
    fileSizeFormatted: "890 KB",
    amount: 486.20,
    contractEndDate: 1798761600000, // 2026-12-31
    cancellationDeadline: 1796083200000, // 2026-11-30
    createdAt: 1735722000000, // 2025-01-01
    updatedAt: 1735722000000,
    isDeleted: false,
    deletedAt: null,
    encryptionIv: "39f281e04a5b6c7d8e9f0123",
    encryptionTag: "b1c2d3e4f5061728394a5b6c7d8e9f01"
  },
  {
    id: 103,
    title: "Einkommensteuerbescheid für das Veranlagungsjahr 2024",
    sender: "Finanzamt München III",
    fileName: "Steuerbescheid_2024_Muenchen.pdf",
    filePath: "vault/docs/103.enc",
    fileChecksum: "9834bf28194e8201a4bc58271e84920194857201948571029384756102938475",
    mainCategory: "Finanzen & Steuern",
    subCategory: "Steuerbescheid",
    mainCategoryId: "cat_finance",
    subCategoryId: "sub_taxes",
    docType: "Bescheid",
    tags: "Finanzamt, Steuererklärung, Erstattung, Werbungskosten, ELSTER",
    ocrText: `Finanzamt München · Deroystraße 6 · 80335 München
Steuernummer: 143/281/90214
Identifikationsnummer: 83 291 048 192

BESCHEID FÜR 2024 ÜBER EINKOMMENSTEUER UND SOLIDARITÄTSZUSCHLAG

Festgesetzte Einkommensteuer:                            14.380,00 €
Abzug durch einbehaltene Lohnsteuer:                   - 15.620,50 €
----------------------------------------------------------------
Verbleibende Erstattung:                                 1.240,50 € Guthaben

Das Guthaben von 1.240,50 € wird auf das angegebene Girokonto überwiesen.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Einspruch erhoben werden.`,
    colorMode: "Graustufen",
    pageCount: 6,
    fileSizeFormatted: "1.4 MB",
    amount: -1240.50,
    contractEndDate: null,
    cancellationDeadline: 1743465600000, // 2025-04-01
    createdAt: 1740873600000,
    updatedAt: 1740873600000,
    isDeleted: false,
    deletedAt: null,
    encryptionIv: "1a2b3c4d5e6f7a8b9c0d1e2f",
    encryptionTag: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d"
  },
  {
    id: 104,
    title: "Mietvertragsanpassung & Nebenkostenabrechnung 2025",
    sender: "Hausverwaltung Isartor Immobilien GmbH",
    fileName: "Nebenkostenabrechnung_2025.pdf",
    filePath: "vault/docs/104.enc",
    fileChecksum: "8472910384719203847192038471920384719203847192038471920384719203",
    mainCategory: "Wohnen & Immobilien",
    subCategory: "Mietvertrag",
    mainCategoryId: "cat_housing",
    subCategoryId: "sub_rent",
    docType: "Abrechnung",
    tags: "Miete, Nebenkosten, Heizung, Hausverwaltung, Isartor, Guthaben",
    ocrText: `Hausverwaltung Isartor Immobilien GmbH · Isartorplatz 5 · 80331 München
Mietobjekt: Maximilianstraße 42, 3. OG links, 80539 München

HEIZ- UND BETRIEBSKOSTENABRECHNUNG FÜR DEN ZEITRAUM 01.01.2025 - 31.12.2025
Wohnfläche: 84,50 m² (Gesamtfläche 720,00 m²)

Umlagefähige Gesamtkosten:
- Heizung und Warmwasseraufbereitung (Fernwärme SWM)      1.420,10 €
- Grundsteuer, Wasser/Abwasser, Müllabfuhr                 540,80 €
- Hausmeister, Treppenhausreinigung, Aufzug                480,20 €
- Gebäudeversicherung und Haftpflicht                      210,00 €
----------------------------------------------------------------
Ihr Anteil an den Betriebskosten                          2.651,10 €
Ihre geleisteten Vorauszahlungen (12 x 230,00 €)          2.760,00 €
----------------------------------------------------------------
Guthaben zu Ihren Gunsten:                                  108,90 €

Das Guthaben wird mit der Miete für April 2026 verrechnet.`,
    colorMode: "Farbe",
    pageCount: 3,
    fileSizeFormatted: "620 KB",
    amount: -108.90,
    contractEndDate: null,
    cancellationDeadline: null,
    createdAt: 1740614400000,
    updatedAt: 1740614400000,
    isDeleted: false,
    deletedAt: null,
    encryptionIv: "9c8b7a6f5e4d3c2b1a0f9e8d",
    encryptionTag: "0f1e2d3c4b5a69788796a5b4c3d2e1f0"
  },
  {
    id: 105,
    title: "Arztbrief & Befundbericht Kardiologie / Belastungs-EKG",
    sender: "Klinikum Rechts der Isar",
    fileName: "Arztbrief_Kardiologie_2026.pdf",
    filePath: "vault/docs/105.enc",
    fileChecksum: "1928374650192837465019283746501928374650192837465019283746501928",
    mainCategory: "Gesundheit & Medizin",
    subCategory: "Arztberichte",
    mainCategoryId: "cat_health",
    subCategoryId: "sub_doctor_reports",
    docType: "Arztbrief",
    tags: "Kardiologie, Checkup, Blutdruck, EKG, Befund, Sportgesundheit",
    ocrText: `Klinikum rechts der Isar der Technischen Universität München
Klinik und Poliklinik für Innere Medizin I - Kardiologie
Prof. Dr. med. H. Schmidt · Ismaninger Straße 22 · 81675 München

PATIENTENBERICHT / CHECK-UP
Patient: Max Mustermann, geb. 14.05.1988
Untersuchungsdatum: 18.02.2026

Diagnose / Befund:
1. Normaler kardiovaskulärer Status ohne pathologischen Befund.
2. Fahrradergometrie bis 225 Watt (100% Soll) symptomfrei durchlaufen.
3. Blutdruckverhalten unter Belastung normoton (max. 175/85 mmHg).
4. Keine Ischämiezeichen im 12-Kanal-EKG.

Empfehlung:
Sporttauglichkeit voll gegeben. Nächste kardiologische Routinekontrolle in 2 Jahren empfohlen.`,
    colorMode: "Farbe",
    pageCount: 2,
    fileSizeFormatted: "410 KB",
    amount: null,
    contractEndDate: null,
    cancellationDeadline: null,
    createdAt: 1739836800000,
    updatedAt: 1739836800000,
    isDeleted: false,
    deletedAt: null,
    encryptionIv: "5e4d3c2b1a0f9e8d7c6b5a4f",
    encryptionTag: "3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f"
  },
  {
    id: 106,
    title: "Jahresabrechnung Strom & Erdgas 2025/2026",
    sender: "Stadtwerke München (SWM)",
    fileName: "SWM_Jahresrechnung_Strom_2026.pdf",
    filePath: "vault/docs/106.enc",
    fileChecksum: "99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff",
    mainCategory: "Wohnen & Energie",
    subCategory: "Strom & Gas",
    mainCategoryId: "cat_housing",
    subCategoryId: "sub_energy",
    docType: "Rechnung",
    tags: "SWM, M-Strom Öko, Zählerstand, Ökostrom, Jahresabrechnung",
    ocrText: `Stadtwerke München Services GmbH · Emmy-Noether-Straße 2 · 80287 München
Kunden-Nr.: 10492819
Vertragskonto: 2049182910
Lieferstelle: Maximilianstraße 42, 80539 München (Zählernr. 1SWM892109)

JAHRESABRECHNUNG M-ÖKOSTROM & ERDGAS (01.01.2025 - 31.12.2025)
Verbrauch Strom: 2.140 kWh zu 31,40 ct/kWh                     671,96 €
Grundpreis Strom: 12 Monate zu 9,50 €/Monat                    114,00 €
----------------------------------------------------------------
Gesamtkosten Strom netto                                       785,96 €
Zuzüglich 19% Umsatzsteuer                                     149,33 €
----------------------------------------------------------------
Gesamtbetrag brutto                                            935,29 €
Ihre gezahlten 11 Abschläge (je 85,00 €)                       935,00 €
----------------------------------------------------------------
Verbleibender Restbetrag / Nachzahlung                             0,29 €

Neuer monatlicher Abschlag ab Mai 2026: 82,00 €.`,
    colorMode: "Farbe",
    pageCount: 4,
    fileSizeFormatted: "780 KB",
    amount: 0.29,
    contractEndDate: 1777593600000, // 2026-04-30
    cancellationDeadline: 1774915200000,
    createdAt: 1738713600000,
    updatedAt: 1738713600000,
    isDeleted: false,
    deletedAt: null,
    encryptionIv: "8b7a6c5d4e3f2a1b0c9d8e7f",
    encryptionTag: "2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d"
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Alle Dokumente', icon: 'FileText' },
  { id: 'cat_contracts', name: 'Verträge', icon: 'FileSignature' },
  { id: 'cat_insurance', name: 'Versicherungen', icon: 'ShieldCheck' },
  { id: 'cat_finance', name: 'Finanzen & Steuern', icon: 'Receipt' },
  { id: 'cat_housing', name: 'Wohnen & Energie', icon: 'Home' },
  { id: 'cat_health', name: 'Gesundheit & Medizin', icon: 'HeartPulse' },
  { id: 'cat_mobility', name: 'Mobilität & Kfz', icon: 'Car' },
  { id: 'cat_authorities', name: 'Behörden & Amtliches', icon: 'Building2' }
];

export const MOCK_SCANNERS = [
  {
    id: 'canon_lide400_wia',
    name: 'Canon CanoScan LiDE 400 (WIA 2.0)',
    protocol: 'WIA' as const,
    connectionType: 'USB 3.0' as const,
    isReady: true,
    supportsAdf: false,
    supportsDuplex: false,
    maxDpi: 4800
  },
  {
    id: 'brother_ads2800_escl',
    name: 'Brother ADS-2800W Document Scanner (eSCL AirScan)',
    protocol: 'eSCL' as const,
    connectionType: 'Wi-Fi / Network' as const,
    isReady: true,
    supportsAdf: true,
    supportsDuplex: true,
    maxDpi: 1200
  },
  {
    id: 'fujitsu_ix1600_sane',
    name: 'Fujitsu ScanSnap iX1600 (SANE Network Backend)',
    protocol: 'SANE' as const,
    connectionType: 'LAN (Gigabit)' as const,
    isReady: true,
    supportsAdf: true,
    supportsDuplex: true,
    maxDpi: 600
  }
];
