
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
  
  // Inisialisasi state dengan data tempatan terus untuk kepantasan (Safari optimization)
  const [reports, setReports] = useState<OPRData[]>(() => {
    const local = localStorage.getItem('opr_reports');
    return local ? JSON.parse(local) : [];
  });
  
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudActive, setIsCloudActive] = useState(!!SHEETS_API_URL);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await sheetsService.fetchReports();
      if (data && data.length >= 0) {
        setReports(data);
      }
    } catch (e) {
      console.error("Gagal memuatkan data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveReport = async (data: OPRData) => {
    setIsLoading(true);
    const success = await sheetsService.saveReport(data);
    if (success) {
      await loadData();
      setActiveTab('list');
    } else {
      alert("Gagal menyimpan data ke Cloud. Sila periksa sambungan internet.");
    }
    setIsLoading(false);
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Hapus laporan ini secara kekal?')) return;
    setIsLoading(true);
    const success = await sheetsService.deleteReport(id);
    if (success) {
      setReports(prev => prev.filter(r => r.id !== id));
      setTimeout(loadData, 1000); 
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
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 no-print" />

      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] animate-pulse no-print" />
      )}

      <nav className="no-print sticky top-4 mx-auto w-full max-w-5xl z-50 px-4 mt-4">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2rem] px-8 py-4 flex items-center justify-between transition-all hover:shadow-blue-500/5">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="flex items-center">
              <img src={MAIN_LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <div className="hidden lg:block border-l border-slate-200 pl-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">SK Laksian Banggi</h1>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${isCloudActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <ICONS.Cloud className={isCloudActive ? 'animate-pulse' : ''} />
                  {isCloudActive ? 'Online' : 'Local'}
                </div>
              </div>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Sistem OPR Digital</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <ICONS.Dashboard /> },
              { id: 'list', label: 'Arkib Laporan', icon: <ICONS.List /> },
              { id: 'new', label: 'Borang Baru', icon: <ICONS.New /> }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AppTab);
                  if(tab.id === 'new') setSelectedReportId(null);
                }}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 group ${
                  activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 pb-32">
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

      <footer className="py-10 text-center border-t border-slate-100 no-print">
         <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">Hak Cipta Terpelihara © {new Date().getFullYear()} SK Laksian Banggi</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
