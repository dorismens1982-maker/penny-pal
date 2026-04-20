import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param sheetName Name of the worksheet
 */
export const exportToExcel = (data: any[], filename: string = 'export', sheetName: string = 'Data') => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate buffer and trigger download
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to generate Excel file');
  }
};
