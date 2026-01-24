
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
            className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50/50 border-b border-slate-100 items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-5">Laporan & Lokasi</div>
          <div className="col-span-2 text-center">Bidang</div>
          <div className="col-span-2 text-center">Tarikh</div>
          <div className="col-span-3 text-right">Tindakan</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredReports.map(report => (
            <div key={report.id} className="group hover:bg-slate-50/80 transition-all duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-6 py-2.5 items-center">
                <div className="col-span-1 lg:col-span-5 flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 ${report.synced ? 'text-emerald-500' : 'text-slate-200'}`} title={report.synced ? 'Synced to Cloud' : 'Local Only'}>
                    <ICONS.Cloud />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-800 uppercase leading-tight line-clamp-1">{report.programName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[200px]">{report.venue || 'Sekolah'}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex col-span-2 justify-center">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryStyles(report.category)}`}>
                    {report.category}
                  </span>
                </div>

                <div className="hidden lg:flex col-span-2 justify-center">
                  <span className="text-[11px] font-bold text-slate-500">
                    {new Date(report.date).toLocaleDateString('ms-MY')}
                  </span>
                </div>

                <div className="col-span-1 lg:col-span-3 flex items-center justify-end gap-1.5">
                  <button onClick={() => onView(report.id)} className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-all">Papar</button>
                  <button onClick={() => onEdit(report.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={() => onDelete(report.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportList;
