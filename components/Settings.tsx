
import React, { useState } from 'react';

interface SettingsProps {
  sheetUrl: string;
  onSaveUrl: (url: string) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

const Settings: React.FC<SettingsProps> = ({ sheetUrl, onSaveUrl, onSyncAll, isSyncing }) => {
  const [url, setUrl] = useState(sheetUrl);

  const gasCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Sediakan header jika kosong
  if (sheet.getLastRow() == 0) {
    sheet.appendRow(["ID", "Program", "Tarikh", "Lokasi", "Kategori", "Pelapor", "Impact", "CreatedAt", "Images_JSON"]);
  }
  
  // Cari jika ID sudah wujud (untuk kemaskini)
  var rows = sheet.getDataRange().getValues();
  var foundIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.id) {
      foundIndex = i + 1;
      break;
    }
  }
  
  var rowData = [
    data.id,
    data.programName,
    data.date,
    data.venue,
    data.category,
    data.reporterName,
    data.impact,
    new Date(data.createdAt).toISOString(),
    JSON.stringify(data.images)
  ];
  
  if (foundIndex > -1) {
    sheet.getRange(foundIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Konfigurasi Google Sheets</h2>
        <p className="text-slate-500 text-sm mb-8">Sambungkan sistem OPR anda ke Google Sheets untuk penyimpanan data online.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Apps Script Web App URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-grow px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <button 
                onClick={() => onSaveUrl(url)}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Simpan URL
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Manual Pemasangan</h3>
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>1. Buka <strong>Google Sheets</strong> baru.</p>
              <p>2. Pergi ke <strong>Extensions > Apps Script</strong>.</p>
              <p>3. Salin dan tampal kod di bawah ke dalam editor script:</p>
              <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl overflow-x-auto font-mono text-[10px] my-4">
                {gasCode}
              </pre>
              <p>4. Klik <strong>Deploy > New Deployment</strong>.</p>
              <p>5. Pilih <strong>Web App</strong>. Set <i>Execute as: Me</i> dan <i>Who has access: Anyone</i>.</p>
              <p>6. Salin URL yang diberikan dan tampal dalam ruangan di atas.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Sinkronisasi Penuh</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Hantar semua data sedia ada ke cloud.</p>
            </div>
            <button 
              onClick={onSyncAll}
              disabled={isSyncing || !sheetUrl}
              className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${
                isSyncing || !sheetUrl ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'
              }`}
            >
              {isSyncing ? 'Sedang Sinkron...' : 'Sinkron Sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
