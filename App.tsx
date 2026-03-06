
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, OPRData } from './types';
import Dashboard from './components/Dashboard';
import ReportList from './components/ReportList';
import ReportForm from './components/ReportForm';
import ReportView from './components/ReportView';
import { MAIN_LOGO_URL, ICONS, SHEETS_API_URL } from './constants';
import { sheetsService } from './services/sheetsService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [reports, setReports] = useState<OPRData[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudActive, setIsCloudActive] = useState(!!SHEETS_API_URL);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await sheetsService.fetchReports();
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.createdAt - a.createdAt);
        setReports(sorted);
      }
    } catch (e) {
      console.error("Fetch data error:", e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const local = localStorage.getItem('opr_reports');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const sorted = [...parsed].sort((a: OPRData, b: OPRData) => b.createdAt - a.createdAt);
          setReports(sorted);
        }
      } catch (e) {}
    }
    loadData();
  }, [loadData]);

  const handleSaveReport = async (data: OPRData) => {
    setIsLoading(true);
    const success = await sheetsService.saveReport(data);
    if (success) {
      setReports(prev => {
        const idx = prev.findIndex(r => r.id === data.id);
        let updated;
        if (idx !== -1) {
          updated = [...prev];
          updated[idx] = data;
        } else {
          updated = [data, ...prev];
        }
        return updated.sort((a, b) => b.createdAt - a.createdAt);
      });
      setActiveTab('list');
      loadData(false);
    } else {
      alert("Gagal menyimpan. Sila cuba lagi.");
    }
    setIsLoading(false);
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Hapus laporan ini secara kekal?')) return;
    setIsLoading(true);
    const success = await sheetsService.deleteReport(id);
    if (success) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
    setIsLoading(false);
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const getReportNumber = (report: OPRData) => {
    const reportDate = new Date(report.date);
    const reportYear = isNaN(reportDate.getTime()) ? new Date(report.createdAt).getFullYear() : reportDate.getFullYear();
    const reportsInSameYear = reports
      .filter(r => {
        const d = new Date(r.date);
        const y = isNaN(d.getTime()) ? new Date(r.createdAt).getFullYear() : d.getFullYear();
        return y === reportYear;
      })
      .sort((a, b) => a.createdAt - b.createdAt);
    const index = reportsInSameYear.findIndex(r => r.id === report.id);
    return index !== -1 ? index + 1 : 1;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="no-print bg-blue-700 text-white px-6 py-2 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCloudActive ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          <span>{isCloudActive ? 'Awan Aktif (Cloud Sync)' : 'Mod Luar Talian'}</span>
        </div>
        <button 
          onClick={() => loadData()} 
          className="bg-white/10 px-3 py-1 rounded-md hover:bg-white/20 transition-all flex items-center gap-1.5"
        >
          {isLoading ? 'MEMPROSES...' : 'SEGARKAN DATA'}
        </button>
      </div>

      <nav className="no-print sticky top-4 mx-auto w-full max-w-5xl z-50 px-4 mt-4">
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img src={MAIN_LOGO_URL} alt="Logo" className="h-8 w-auto transition-transform hover:scale-110" />
            <div className="hidden lg:block border-l border-slate-200 pl-4">
              <h1 className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tight">SK LAKSIAN BANGGI</h1>
              <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">SISTEM OPR DIGITAL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <ICONS.Dashboard /> },
              { id: 'list', label: 'Arkib', icon: <ICONS.List /> },
              { id: 'new', label: 'Baru', icon: <ICONS.New /> }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AppTab);
                  if(tab.id === 'new') setSelectedReportId(null);
                }}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 pb-32">
        {activeTab === 'dashboard' && <Dashboard reports={reports} onViewReport={(id) => { setSelectedReportId(id); setActiveTab('view'); }} />}
        {activeTab === 'list' && (
          <ReportList 
            reports={reports} 
            onView={(id) => { setSelectedReportId(id); setActiveTab('view'); }} 
            onDelete={handleDeleteReport} 
            onEdit={(id) => { setSelectedReportId(id); setActiveTab('new'); }}
          />
        )}
        {activeTab === 'new' && (
          <ReportForm 
            onSave={handleSaveReport} 
            initialData={selectedReport}
            onCancel={() => setActiveTab('list')}
          />
        )}
        {activeTab === 'view' && selectedReport && (
          <ReportView 
            data={selectedReport} 
            reportNumber={getReportNumber(selectedReport)}
            onBack={() => setActiveTab('list')} 
            onEdit={() => setActiveTab('new')}
          />
        )}
      </main>
      
      {/* Footer telah dikeluarkan mengikut permintaan */}
    </div>
  );
};

export default App;
