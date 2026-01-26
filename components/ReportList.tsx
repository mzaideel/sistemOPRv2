
import React, { useState, useMemo } from 'react';
import { OPRData } from '../types';
import { ICONS } from '../constants';

interface ReportListProps {
  reports: OPRData[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports = [], onView, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    const safeReports = Array.isArray(reports) ? reports : [];
    if (!searchTerm) return safeReports;
    
    const term = searchTerm.toLowerCase();
    return safeReports.filter(r => {
      const name = (r?.programName || '').toLowerCase();
      const reporter = (r?.reporterName || '').toLowerCase();
      const cat = (r?.category || '').toLowerCase();
      return name.includes(term) || reporter.includes(term) || cat.includes(term);
    });
  }, [reports, searchTerm]);

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Pentadbiran': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Kurikulum': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Hal Ehwal Murid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Kokurikulum': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn min-h-[400px] block">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Arkib Laporan</h2>
          <p className="text-sm text-slate-500">Menapis {filteredReports.length} rekod sedia ada.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari program atau pelapor..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden block">
        <div className="divide-y divide-slate-100">
          {filteredReports.map((report, idx) => (
            <div 
              key={report.id || idx} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors gap-4 border-l-4 border-l-transparent hover:border-l-blue-600"
            >
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getCategoryStyles(report.category)}`}>
                    {report.category || 'Umum'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {formatDateLabel(report.date)}
                  </span>
                </div>
                <h3 className="text-[14px] font-black text-slate-900 uppercase leading-tight truncate">
                  {report.programName || 'Tanpa Tajuk'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                  📍 {report.venue || 'Lokasi tidak dinyatakan'} • 👤 {report.reporterName || 'Pelapor'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => onView(report.id)} 
                  className="px-5 py-2.5 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                >
                  PAPAR
                </button>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(report.id)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <ICONS.Edit />
                  </button>
                  <button onClick={() => onDelete(report.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <ICONS.Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📂
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tiada rekod laporan ditemui</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="mt-4 text-blue-600 text-xs font-bold underline">Set semula carian</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportList;
