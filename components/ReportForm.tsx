
import React, { useState } from 'react';
import { OPRData, ActivityImage } from '../types';
import { CATEGORIES, ICONS } from '../constants';

interface ReportFormProps {
  onSave: (data: OPRData) => void;
  onCancel: () => void;
  initialData?: OPRData;
}

const ReportForm: React.FC<ReportFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<OPRData>>({
    id: crypto.randomUUID(),
    programName: '',
    date: '',
    time: '',
    venue: '',
    targetGroup: '',
    objectives: [''],
    impact: '',
    reporterName: '',
    reporterPosition: '',
    category: 'Kurikulum',
    images: [],
    createdAt: Date.now(),
    ...initialData
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...(formData.objectives || [])];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setFormData(prev => ({ ...prev, objectives: [...(prev.objectives || []), ''] }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: (prev.objectives || []).filter((_, i) => i !== index)
    }));
  };

  const compressImage = (file: File): Promise<ActivityImage> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.65);
          resolve({
            id: crypto.randomUUID(),
            url: compressedUrl,
            caption: '',
            isLandscape: width >= height
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsProcessing(true);
    const currentImages = formData.images || [];
    const remainingSlots = 4 - currentImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    try {
      for (const file of filesToProcess) {
        const newImg = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), newImg]
        }));
      }
    } catch (err) {
      console.error("Gagal memproses gambar:", err);
      alert("Gagal memuat naik gambar. Sila cuba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const images = [...(formData.images || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [images[index], images[newIndex]] = [images[newIndex], images[index]];
    setFormData(prev => ({ ...prev, images }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as OPRData); }} className="max-w-4xl mx-auto space-y-12 pb-32 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{initialData ? 'Kemaskini Laporan' : 'Laporan OPR Baru'}</h2>
          <p className="text-slate-500 mt-1">Sila lengkapkan butiran program & lensa aktiviti (Maks 4 gambar).</p>
        </div>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Section 1: Maklumat Utama */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20">1</span>
          <h3 className="text-xl font-bold text-slate-900">Maklumat Utama</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Program / Aktiviti</label>
            <input 
              name="programName" value={formData.programName} onChange={handleChange} required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              placeholder="Contoh: Majlis Sanjungan Budi 2024"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Tarikh Pelaksanaan</label>
            <input 
              type="date" name="date" value={formData.date} onChange={handleChange} required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Masa</label>
            <input 
              type="text" name="time" value={formData.time} onChange={handleChange} required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
              placeholder="Contoh: 8:00 Pagi - 10:30 Pagi"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Bidang / Kategori</label>
            <select 
              name="category" value={formData.category} onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempat / Lokasi</label>
            <input 
              name="venue" value={formData.venue} onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Dewan Seri Banggi"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Kumpulan Sasaran</label>
            <input 
              name="targetGroup" value={formData.targetGroup} onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Semua Guru & Kakitangan"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Objektif & Impak */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20">2</span>
              <h3 className="text-xl font-bold text-slate-900">Objektif & Impak</h3>
            </div>
            <button 
              type="button" 
              onClick={addObjective}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              <span>+</span> Tambah Objektif
            </button>
          </div>
          
          <div className="space-y-4 mb-8">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Senarai Objektif</label>
            {formData.objectives?.map((obj, idx) => (
              <div key={idx} className="flex gap-4 group items-center animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                  {idx + 1}
                </div>
                <input 
                  value={obj} 
                  onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                  className="flex-grow px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Masukkan objektif program..."
                />
                {(formData.objectives?.length || 0) > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeObjective(idx)} 
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <ICONS.Trash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Impak / Refleksi Program</label>
            <textarea 
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              rows={4}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
              placeholder="Nyatakan impak atau refleksi selepas pelaksanaan program..."
            />
          </div>
        </div>
      </section>

      {/* Section 3: Lensa Aktiviti */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20">3</span>
          <h3 className="text-xl font-bold text-slate-900">Lensa Aktiviti (Maks 4 Gambar)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {formData.images?.map((img, idx) => (
            <div key={img.id} className="relative bg-slate-50 p-3 rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-200 relative">
                <img src={img.url} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1">
                   <button type="button" onClick={() => moveImage(idx, 'up')} className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm text-slate-700 hover:bg-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
                   <button type="button" onClick={() => moveImage(idx, 'down')} className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm text-slate-700 hover:bg-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                   <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter(i => i.id !== img.id) }))} className="p-2 bg-red-500/90 backdrop-blur text-white rounded-xl shadow-sm hover:bg-red-500"><ICONS.Trash /></button>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Keterangan..."
                className="w-full mt-3 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] outline-none focus:border-blue-500 font-medium"
                value={img.caption}
                onChange={(e) => {
                  const newImages = [...(formData.images || [])];
                  newImages[idx].caption = e.target.value;
                  setFormData(prev => ({ ...prev, images: newImages }));
                }}
              />
            </div>
          ))}
          {(formData.images?.length || 0) < 4 && !isProcessing && (
            <label className="aspect-[16/9] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all text-slate-400 group">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold">+</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Pilih Gambar</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          {isProcessing && (
            <div className="aspect-[16/9] border-2 border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Memproses...</span>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Penyedia Laporan */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20">4</span>
          <h3 className="text-xl font-bold text-slate-900">Penyedia Laporan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Pelapor</label>
            <input 
              name="reporterName" value={formData.reporterName} onChange={handleChange} required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
              placeholder="Sila masukkan nama penuh"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Jawatan</label>
            <input 
              name="reporterPosition" value={formData.reporterPosition} onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              placeholder="Contoh: Guru Perpustakaan & Media"
            />
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-6 z-50 flex justify-center gap-4 no-print shadow-2xl">
        <button type="button" onClick={onCancel} className="px-10 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors">Batal</button>
        <button 
          type="submit" 
          disabled={isProcessing} 
          className={`px-12 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {isProcessing ? 'Memproses...' : (initialData ? 'Simpan Perubahan' : 'Jana Laporan OPR')}
        </button>
      </div>
    </form>
  );
};

export default ReportForm;
