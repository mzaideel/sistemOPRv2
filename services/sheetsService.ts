
import { OPRData } from '../types';
import { SHEETS_API_URL } from '../constants';

export const sheetsService = {
  async fetchReports(): Promise<OPRData[]> {
    if (!SHEETS_API_URL) {
      const localData = localStorage.getItem('opr_reports');
      return localData ? JSON.parse(localData) : [];
    }

    try {
      const response = await fetch(`${SHEETS_API_URL}?action=read`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Ralat Pelayan: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        localStorage.setItem('opr_reports', JSON.stringify(data));
        return data;
      }
      return [];
    } catch (error) {
      console.warn("Cloud Sync gagal. Menggunakan data tempatan:", error);
      const localData = localStorage.getItem('opr_reports');
      return localData ? JSON.parse(localData) : [];
    }
  },

  async saveReport(report: OPRData): Promise<boolean> {
    // Simpan ke localStorage dahulu (Offline First)
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
      // Kita gunakan mode 'no-cors' untuk POST ke Google Apps Script
      // Ini mengelakkan masalah Pre-flight OPTIONS request yang selalu gagal di GAS
      await fetch(SHEETS_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: JSON.stringify({ action: 'upsert', data: report })
      });
      return true;
    } catch (error) {
      console.error("Gagal menyimpan ke Cloud:", error);
      return true; // Return true kerana data sudah selamat di localStorage
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
