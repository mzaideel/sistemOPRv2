
import { OPRData } from '../types';
import { SHEETS_API_URL } from '../constants';

export const sheetsService = {
  async fetchReports(): Promise<OPRData[]> {
    // Ambil data tempatan dahulu
    let fallback: OPRData[] = [];
    try {
      const localData = localStorage.getItem('opr_reports');
      fallback = localData ? JSON.parse(localData) : [];
    } catch (e) {
      console.warn("Gagal membaca localStorage", e);
      fallback = [];
    }

    if (!SHEETS_API_URL) return fallback;

    try {
      // Gunakan fetch yang paling asas untuk keserasian Safari lama/baru
      const response = await fetch(`${SHEETS_API_URL}?action=read&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        mode: 'cors'
      });

      if (!response.ok) throw new Error("Server response not ok");

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Safari Fix: Hanya simpan 20 laporan terakhir di local jika data terlalu besar (elakkan quota exceeded)
        const dataToCache = data.slice(0, 20);
        try {
          localStorage.setItem('opr_reports', JSON.stringify(dataToCache));
        } catch (e) {
          localStorage.removeItem('opr_reports'); // Bersihkan jika penuh
          console.warn("Storage penuh, memori dibersihkan");
        }
        return data;
      }
      return fallback;
    } catch (error) {
      console.error("Cloud Sync Error:", error);
      return fallback;
    }
  },

  async saveReport(report: OPRData): Promise<boolean> {
    try {
      const local = JSON.parse(localStorage.getItem('opr_reports') || '[]');
      const existsIndex = local.findIndex((r: any) => r.id === report.id);
      
      if (existsIndex !== -1) {
        local[existsIndex] = report;
      } else {
        local.unshift(report);
      }
      localStorage.setItem('opr_reports', JSON.stringify(local.slice(0, 20)));
    } catch (e) {
      console.error("Local save error", e);
    }

    if (!SHEETS_API_URL) return true;

    try {
      // Gunakan payload yang lebih ringan untuk POST
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', data: report })
      });
      return true;
    } catch (error) {
      console.error("Cloud save error:", error);
      return true; // Benarkan user teruskan dengan data local
    }
  },

  async deleteReport(id: string): Promise<boolean> {
    try {
      const local = JSON.parse(localStorage.getItem('opr_reports') || '[]');
      localStorage.setItem('opr_reports', JSON.stringify(local.filter((r: any) => r.id !== id)));
    } catch (e) {}

    if (!SHEETS_API_URL) return true;

    try {
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'delete', id })
      });
      return true;
    } catch (error) {
      return true;
    }
  }
};
