
import { OPRData } from '../types';
import { SHEETS_API_URL } from '../constants';

export const sheetsService = {
  async fetchReports(): Promise<OPRData[]> {
    // Ambil data tempatan dahulu sebagai sandaran pantas
    const localData = localStorage.getItem('opr_reports');
    const fallback = localData ? JSON.parse(localData) : [];

    if (!SHEETS_API_URL) return fallback;

    try {
      // Tambah timestamp untuk mengelakkan cache Safari yang agresif
      const url = `${SHEETS_API_URL}?action=read&_t=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Simpan versi terbaru ke cache tempatan
        localStorage.setItem('opr_reports', JSON.stringify(data));
        return data;
      }
      return fallback;
    } catch (error) {
      console.warn("Cloud Sync gagal atau disekat oleh Safari. Menggunakan data tempatan:", error);
      return fallback;
    }
  },

  async saveReport(report: OPRData): Promise<boolean> {
    const local = JSON.parse(localStorage.getItem('opr_reports') || '[]');
    const existsIndex = local.findIndex((r: any) => r.id === report.id);
    
    if (existsIndex !== -1) {
      local[existsIndex] = report;
    } else {
      local.unshift(report);
    }
    localStorage.setItem('opr_reports', JSON.stringify(local));

    if (!SHEETS_API_URL) return true;

    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: JSON.stringify({ action: 'upsert', data: report })
      });
      return true;
    } catch (error) {
      console.error("Gagal menyimpan ke Cloud:", error);
      return true; 
    }
  },

  async deleteReport(id: string): Promise<boolean> {
    const local = JSON.parse(localStorage.getItem('opr_reports') || '[]');
    localStorage.setItem('opr_reports', JSON.stringify(local.filter((r: any) => r.id !== id)));

    if (!SHEETS_API_URL) return true;

    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: JSON.stringify({ action: 'delete', id })
      });
      return true;
    } catch (error) {
      console.error("Gagal memadam dari Cloud:", error);
      return true;
    }
  }
};
