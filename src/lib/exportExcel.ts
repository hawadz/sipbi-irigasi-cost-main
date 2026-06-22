import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface RabItem {
  uraian: string;
  satuan: string;
  volume: number;
  hargaSatuan: number;
  jumlahBiaya: number;
}

export const exportRAB = async (
  daerah: string,
  nomenklatur: string,
  building: string,
  kategoriLabel: string,
  items: RabItem[],
  total: number
) => {
  // Membuat Workbook dan Worksheet baru
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('RAB', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  // 1. Mengatur Lebar Kolom agar tidak sempit
  worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'uraian', width: 45 },
    { key: 'satuan', width: 10 },
    { key: 'volume', width: 12 },
    { key: 'harga', width: 18 },
    { key: 'pertahun', width: 12 },
    { key: 'jumlah', width: 22 },
  ];

  // Baris 1: Kosong
  worksheet.addRow([]);
  
  // Baris 2 & 3: Judul (Di-merge dan di-Bold ke tengah)
  const titleRow1 = worksheet.addRow(['', 'RINCIAN ANGGARAN BIAYA (RAB)', '', '', '', '', '']);
  worksheet.mergeCells('B2:G2');
  titleRow1.getCell(2).font = { bold: true, size: 12 };
  titleRow1.getCell(2).alignment = { horizontal: 'center' };

  const titleRow2 = worksheet.addRow(['', 'BANGUNAN PELENGKAP IRIGASI', '', '', '', '', '']);
  worksheet.mergeCells('B3:G3');
  titleRow2.getCell(2).font = { bold: true, size: 12 };
  titleRow2.getCell(2).alignment = { horizontal: 'center' };

  worksheet.addRow([]); // Baris 4 kosong

  // Baris 5 - 9: Info Proyek
  worksheet.addRow(['', 'Satker', ': PU SDA KAB. SUKABUMI', '', '', '', '']);
  worksheet.addRow(['', 'Daerah Irigasi', `: ${daerah || '-'}`, '', '', '', '']);
  worksheet.addRow(['', 'Nomenklatur', `: ${nomenklatur || '-'}`, '', '', '', '']);
  worksheet.addRow(['', 'Kabupaten', ': Sukabumi', '', '', '', '']);
  worksheet.addRow(['', 'Provinsi', ': Jawa Barat', '', '', '', '']);
  
  worksheet.addRow([]); // Baris 10 kosong

  // Baris 11 & 12: Header Tabel
  const headerRow1 = worksheet.addRow(['No', 'Uraian', 'Satuan', 'Volume', 'Harga Satuan (Rp)', 'Pertahun', 'Jumlah Biaya (Rp)']);
  const headerRow2 = worksheet.addRow(['1', '2', '3', '4', '5', '6', '7']);

  // Styling Header Tabel (Bold, Tengah, Bergaris)
  [headerRow1, headerRow2].forEach(row => {
    row.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });

  // Baris 13: Sub-header Pekerjaan Bangunan
  const subHeader = worksheet.addRow(['I', `Pekerjaan ${building}`, '', '', '', '', '']);
  subHeader.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    if(colNumber === 1) cell.alignment = { horizontal: 'center' };
  });

  // Looping Data Rincian Pekerjaan
  items.forEach((item, index) => {
    const row = worksheet.addRow([
      index + 1,
      item.uraian,
      item.satuan,
      item.volume,
      item.hargaSatuan,
      '', // Kolom Pertahun dikosongkan sesuai contoh RAB
      item.jumlahBiaya
    ]);

    // Styling setiap baris data (Borders & Format Angka)
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      
      // Rata tengah untuk No dan Satuan
      if (colNumber === 1 || colNumber === 3) cell.alignment = { horizontal: 'center' };
      
      // Format pemisah ribuan otomatis untuk Volume, Harga, dan Jumlah
      if (colNumber === 4 || colNumber === 5 || colNumber === 7) {
        cell.numFmt = '#,##0'; 
      }
    });
  });

  // Footer: JUMLAH TOTAL
  const footerRow1 = worksheet.addRow(['', 'JUMLAH', '', '', '', '', total]);
  worksheet.mergeCells(`B${footerRow1.number}:F${footerRow1.number}`); // Gabung kolom Uraian s.d Pertahun
  footerRow1.getCell(2).alignment = { horizontal: 'center' };
  footerRow1.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    if (colNumber === 7) cell.numFmt = '#,##0'; // Format angka total
  });

  // Footer: KATEGORI PENANGANAN
  const footerRow2 = worksheet.addRow(['', 'KATEGORI PENANGANAN', `: ${kategoriLabel.toUpperCase()}`, '', '', '', '']);
  worksheet.mergeCells(`C${footerRow2.number}:G${footerRow2.number}`);
  footerRow2.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF000000' } };
    if (colNumber >= 2 && colNumber <= 7) {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    }
  });

  // Render file menjadi file .xlsx dan Download
  const buffer = await workbook.xlsx.writeBuffer();
  const nomStr = nomenklatur ? `_${nomenklatur.replace(/\s+/g, '_')}` : "";
  const fname = `RAB_${(daerah || "DI").replace(/\s+/g, "_")}${nomStr}_${building.replace(/\s+/g, "_")}.xlsx`;
  
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fname);
};