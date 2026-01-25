
import React, { useState } from 'react';
import { OPRData } from '../types';
import { ICONS } from '../constants';

interface ReportListProps {
  reports: OPRData[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onView, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter(r => 
    r.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Pentadbiran': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Kurikulum': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Hal Ehwal Murid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Kokurikulum': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDateWithDayAndTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      const daysMalay = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
      const dayName = daysMalay[date.getDay()];
      
      const timePart = timeStr ? ` (${timeStr})` : '';
      return `${day}/${month}/${year} | ${dayName}${timePart}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Arkib Laporan</h2>
          <p className="text-sm text-slate-500">Senarai rekod OPR SK Laksian Banggi.</p>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Cari laporan..."
            className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:shadow-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50/50 border-b border-slate-100 items-center">
          <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Laporan & Lokasi</div>
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Bidang</div>
          <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Tarikh, Hari & Masa</div>
          <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredReports.map(report => (
            <div key={report.id} className="group hover:bg-slate-50/80 transition-all duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-6 py-2.5 items-center">
                
                <div className="col-span-1 lg:col-span-5">
                  <h3 className="text-[13px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight line-clamp-1 uppercase">
                    {report.programName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[200px]">
                      {report.venue || 'Bilik Mesyuarat'}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      {report.reporterName}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex col-span-2 justify-center">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none ${getCategoryStyles(report.category)}`}>
                    {report.category}
                  </span>
                </div>

                <div className="hidden lg:flex col-span-2 justify-center">
                  <span className="text-[10px] font-bold text-slate-500 text-center">
                    {formatDateWithDayAndTime(report.date, report.time)}
                  </span>
                </div>

                <div className="lg:hidden flex items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getCategoryStyles(report.category)}`}>
                    {report.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {formatDateWithDayAndTime(report.date, report.time)}
                  </span>
                </div>

                <div className="col-span-1 lg:col-span-3 flex items-center justify-end gap-1.5 mt-2 lg:mt-0">
                  <button onClick={() => onView(report.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-all active:scale-95 shrink-0">
                    <span>Papar</span>
                  </button>
                  <button onClick={() => onEdit(report.id)} title="Edit" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => onDelete(report.id)} title="Padam" className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-4 opacity-10">📂</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiada rekod</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center no-print px-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {filteredReports.length} Entri Dijumpai
        </p>
        <div className="h-px bg-slate-100 flex-grow mx-4 hidden sm:block" />
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">OPR Digital SKLB</p>
      </div>
    </div>
  );
};

export default ReportList;
