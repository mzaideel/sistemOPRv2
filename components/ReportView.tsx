
import React, { useRef, useState } from 'react';
import { OPRData } from '../types';
import { MAIN_LOGO_URL, SCHOOL_NAME, ICONS } from '../constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportViewProps {
  data: OPRData;
  reportNumber?: number;
  onBack: () => void;
  onEdit: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ data, reportNumber = 1, onBack, onEdit }) => {
  const oprRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    // Sediakan tajuk dokumen untuk tujuan simpanan cetakan
    const originalTitle = document.title;
    document.title = `OPR_${data.programName.replace(/\s+/g, '_')}_SKLB`;
    
    // Memberi sedikit masa untuk tajuk dikemaskini sebelum cetak
    setTimeout(() => {
      window.print();
      // Kembalikan tajuk asal selepas kotak dialog cetak ditutup
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }, 300);
  };

  const handleDownload = async () => {
    if (!oprRef.current) return;
    
    try {
      setIsGenerating(true);
      
      // Gunakan html2canvas untuk menangkap elemen OPR
      // scale: 2 atau 3 untuk kualiti imej yang lebih tajam
      const canvas = await html2canvas(oprRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Sediakan dokumen PDF bersaiz A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`OPR_${data.programName.replace(/\s+/g, '_')}_SKLB.pdf`);
      
    } catch (error) {
      console.error('Gagal menjana PDF:', error);
      alert('Maaf, ralat berlaku semasa menjana PDF. Sila cuba gunakan butang "Cetak" dan pilih "Save as PDF".');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format tarikh ke hb/bln/thn (Contoh: 21/01/2026)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Generate Bil. Laporan format: 01/2026
  const getFileCode = () => {
    const date = new Date(data.date);
    const year = isNaN(date.getTime()) ? new Date(data.createdAt).getFullYear() : date.getFullYear();
    const seq = reportNumber.toString().padStart(2, '0');
    return `${seq}/${year}`;
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn mb-20 px-4">
      {/* Action Bar */}
      <div className="no-print flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-100">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-all group px-4 py-2 rounded-xl hover:bg-slate-50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="hidden sm:inline">Kembali</span>
        </button>
        
        <div className="flex items-center gap-3">
          {isGenerating && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Menjana PDF...</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={onEdit} 
              disabled={isGenerating}
              title="Edit Laporan"
              className="p-3 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 group disabled:opacity-50"
            >
              <ICONS.Edit />
            </button>
            <button 
              onClick={handleDownload} 
              disabled={isGenerating}
              title="Muat Turun PDF"
              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 group disabled:opacity-50"
            >
              <ICONS.Download />
            </button>
            <button 
              onClick={handlePrint} 
              disabled={isGenerating}
              title="Cetak Laporan"
              className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 group disabled:opacity-50"
            >
              <ICONS.Print />
            </button>
          </div>
        </div>
      </div>

      {/* OPR Page Container - Professional A4 Layout */}
      <div 
        ref={oprRef}
        className="opr-page bg-white shadow-2xl border border-slate-100 mx-auto font-sans relative overflow-hidden" 
        style={{ width: '210mm', height: '297mm', padding: '0', minWidth: '210mm', minHeight: '297mm' }}
      >
        
        {/* Official Letterhead Header */}
        <header className="relative flex items-center justify-between px-10 pt-10 pb-6 border-b-4 border-slate-900 bg-slate-50/30">
          <div className="flex items-center gap-6">
            <img src={MAIN_LOGO_URL} className="h-20 w-auto object-contain" alt="Logo" />
            <div className="h-16 w-px bg-slate-300" />
          </div>
          <div className="flex-grow text-right">
            <h1 className="text-[20px] font-serif-official font-bold uppercase text-slate-900 tracking-tight leading-none mb-1">
              {SCHOOL_NAME}
            </h1>
            <p className="text-[9px] font-black tracking-[0.4em] text-blue-600 uppercase mb-2">Kementerian Pendidikan Malaysia</p>
            <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-md">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase">One Page Report (OPR)</p>
            </div>
          </div>
        </header>

        {/* Main Body - 2 Column Split */}
        <div className="grid grid-cols-12 h-[calc(100%-140px)]">
          
          {/* LEFT COLUMN: All Written Reports */}
          <div className="col-span-6 border-r-2 border-slate-100 p-8 flex flex-col justify-between overflow-hidden">
            <div className="space-y-5">
              {/* Program Metadata */}
              <div className="space-y-3">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1.5">Laporan Program / Aktiviti</label>
                  <h2 className="text-base font-black text-white leading-tight uppercase bg-slate-900 p-3 rounded-xl shadow-md">
                    {data.programName}
                  </h2>
                </div>
                
                {/* Metadata List */}
                <div className="space-y-1.5">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-20 flex-shrink-0">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Tarikh</label>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">{formatDate(data.date)}</p>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-20 flex-shrink-0">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Bidang</label>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">{data.category}</p>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-20 flex-shrink-0">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Lokasi</label>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 truncate">{data.venue || '-'}</p>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-20 flex-shrink-0">
                      <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Sasaran</label>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 truncate">{data.targetGroup || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black">A</div>
                  <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Objektif</h3>
                </div>
                <div className="pl-7 space-y-1">
                  {data.objectives.filter(o => o.trim()).map((obj, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      <p className="text-[9px] font-bold text-slate-700 leading-tight">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact / Reflection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black">B</div>
                  <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Impak & Refleksi</h3>
                </div>
                <div className="pl-7">
                  <p className="text-[9px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-emerald-100 pl-3 py-1">
                    "{data.impact || 'Maklumat refleksi akan dikemaskini oleh pihak urusetia program.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Section - Disediakan oleh */}
            <div className="pt-6 mt-6 border-t border-slate-100">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Disediakan Oleh:</p>
               <div className="h-0.5 w-48 bg-slate-900 mb-2" />
               <p className="text-[12px] font-black text-slate-900 uppercase leading-none">{data.reporterName || 'NAMA PELAPOR'}</p>
               <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1.5">{data.reporterPosition || 'JAWATAN'}</p>
               <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Sekolah Kebangsaan Laksian Banggi</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Lensa Aktiviti (4 Images) */}
          <div className="col-span-6 bg-slate-50/20 p-6 flex flex-col items-center border-l-2 border-slate-100 overflow-hidden">
            <div className="w-full flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">C</div>
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">Lensa Aktiviti (4 Gambar)</h3>
            </div>
            
            {/* Grid of 4 Photos - Saiz 9cm x 5.31cm */}
            <div className="flex flex-col gap-2 w-full items-center justify-center">
              {[0, 1, 2, 3].map((i) => {
                const img = data.images[i];
                return (
                  <div 
                    key={i} 
                    className="relative bg-white border border-slate-100 p-0.5 shadow-sm overflow-hidden flex flex-col"
                    style={{ width: '90mm', height: '53.1mm' }}
                  >
                    <div className="w-full h-full overflow-hidden bg-slate-50 relative">
                      {img ? (
                        <img 
                          src={img.url} 
                          crossOrigin="anonymous"
                          className={`w-full h-full ${img.isLandscape ? 'object-cover' : 'object-contain bg-slate-100'}`} 
                          alt={`Foto ${i + 1}`} 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                      )}
                      
                      {img?.caption && (
                        <div className="absolute bottom-1 left-1 right-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/40 shadow-sm">
                          <p className="text-[6px] font-black text-slate-800 uppercase tracking-tight text-center leading-tight line-clamp-1">
                            {img.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verification Tag */}
            <div className="mt-auto w-full pt-4 flex justify-between items-end opacity-40">
               <div>
                  <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Bil. Laporan:</p>
                  <p className="text-[7px] font-mono font-bold text-slate-500">{getFileCode()}</p>
               </div>
               <div className="text-[10px] font-black text-slate-200 border-2 border-slate-100 px-2 py-0.5 rounded rotate-[-15deg]">SKLB</div>
            </div>
          </div>
        </div>

        {/* Global Footer Line (Print Only) */}
        <div className="hidden print:block absolute bottom-2 left-10 right-10 flex justify-between items-center text-[6px] text-slate-300 font-bold uppercase tracking-[0.2em]">
          <span>Dicetak Secara Digital • SK Laksian Banggi • Banggi, Kudat</span>
          <span>Sistem OPR Digital SKLB</span>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
