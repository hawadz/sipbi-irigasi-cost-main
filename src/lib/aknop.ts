export type BuildingKey =
  | "Gorong-gorong"
  | "Bangunan Terjun"
  | "Jembatan Saluran"
  | "Talang"
  | "Bangunan Pelimpah"
  | "Bangunan Pembuang"
  | "Bangunan Pembilas"
  | "Bangunan Penahan";

export const BUILDINGS: BuildingKey[] = [
  "Gorong-gorong",
  "Bangunan Terjun",
  "Jembatan Saluran",
  "Talang",
  "Bangunan Pelimpah",
  "Bangunan Pembuang",
  "Bangunan Pembilas",
  "Bangunan Penahan",
];

export const TASKS: Record<BuildingKey, string[]> = {
  "Gorong-gorong": [
    "Pengurasan sedimen",
    "Pembersihan sampah saluran",
    "Pengangkutan sampah sedimen",
    "Pembongkaran pasangan rusak",
    "Galian tanah pondasi",
    "Urugan Kembali",
    "Pasangan batu kali",
    "Plesteran",
    "Acian",
    "Beton lantai kerja",
    "Tambal retak mortar",
  ],
  "Bangunan Terjun": [
    "Pembersihan sedimen",
    "Pasangan batu kali",
    "Plesteran",
    "Beton bertulang",
    "Pembesian",
    "Bekisting",
    "Perbaikan lantai olak",
    "Galian tanah",
    "Urugan Kembali",
  ],
  "Jembatan Saluran": [
    "Pembobokan Beton Rusak",
    "Beton bertulang",
    "Pembesian",
    "Bekisting",
    "Plesteran",
    "Acian",
    "Tambalan bocor mortar",
    "Pembesihan karat",
    "Pengecatan besi railing",
    "Galian tanah",
    "Urugan kembali",
  ],
  Talang: [
    "Tambalan Bocor",
    "Plesteran waterproofing",
    "Acian",
    "Pembobokan beton",
    "Beton Bertulang",
    "Pembesian",
    "Bekisting",
    "Galian pondasi",
    "Urugan kembali",
    "Beton pondasi",
    "Pasangan batu kali",
  ],
  "Bangunan Pelimpah": [
    "Pembersihan sedimen",
    "Pengangkutan material",
    "Galian tanah",
    "Pasangan batu kali",
    "Bronjong",
    "Pembobokan beton",
    "Beton bertulang",
    "Pembesian",
    "Bekisting",
  ],
  "Bangunan Pembuang": [
    "Pembersihan saluran",
    "Pengangkutan sampah/sedimen",
    "Perbaikan pintu air",
    "Penggantian baut/besi",
    "Pengecatan pintu",
    "Pelumasan pintu",
    "Plesteran",
    "Acian",
    "Beton bertulang",
    "Pembesian",
    "Bekisting",
  ],
  "Bangunan Pembilas": [
    "Pengurasan sedimen",
    "Pembersihan saluran pembilas",
    "Pelumasan pintu",
    "Pengecatan pintu",
    "Penggantian baut",
    "Pengecatan pintu",
    "Beton bertulang",
    "Pembesian",
    "Bekisting",
    "Pasangan batu kali",
    "Plesteran",
  ],
  "Bangunan Penahan": [
    "Galian tanah",
    "Pasangan batu",
    "Pemadatan tanah",
    "Pembongkaran bronjong/pasangan batu",
    "Pemasangan bronjong",
    "Plesteran",
  ],
};

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(isFinite(n) ? n : 0);
