
import React, { useMemo } from 'react';
import { OPRData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORIES } from '../constants';

interface DashboardProps {
  reports: OPRData[];
  onViewReport: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reports = [], onViewReport }) => {
  const stats = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      count: (reports || []).filter(r => r.category === cat).length
    }));
  }, [reports]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#94a3b8'];

  const recentReports = useMemo(() => {
    return [...(reports || [])].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [reports]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Ringkasan Eksekutif</h2>
          <p className="text-slate-500 mt-1">Gambaran prestasi dan statistik pelaporan OPR SK Laksian Banggi.</p>
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Kemaskini: {new Date().toLocaleDateString('ms-MY')}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Jumlah Laporan', value: (reports || []).length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📊' },
          { label: 'Laporan Bulan Ini', value: (reports || []).filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '📅' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center text-2xl`}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{item.label}</h3>
              <p className={`text-4xl font-black mt-1 ${item.color}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Analisis Mengikut Kategori</h3>
          <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={40}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Laporan Terkini</h3>
          <div className="space-y-6">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div 
                  key={report.id} 
                  onClick={() => onViewReport(report.id)}
                  className="group cursor-pointer flex gap-4 items-start p-2 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm uppercase">{report.programName || 'TIADA NAMA'}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{report.date} • {report.category}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-2 opacity-20">📂</div>
                <p className="text-slate-400 text-sm">Tiada rekod laporan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
