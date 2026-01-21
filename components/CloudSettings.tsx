
import React, { useState } from 'react';
import { X, Database, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';

interface CloudSettingsProps {
  onClose: () => void;
  onSave: (config: any) => void;
  currentConfig: any;
}

const CloudSettings: React.FC<CloudSettingsProps> = ({ onClose, onSave, currentConfig }) => {
  const [configStr, setConfigStr] = useState(JSON.stringify(currentConfig || {}, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(configStr);
      onSave(parsed);
      onClose();
    } catch (e) {
      alert("Invalid JSON format. Please paste the exact config object from Firebase Console.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Cloud Sync Settings</h3>
              <p className="text-xs text-slate-500">Connect to your personal Firebase project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-800 leading-relaxed">
              To split bills with others across devices, you must provide your own Firebase configuration. 
              Go to <strong>Firebase Console &gt; Project Settings</strong> and copy the <strong>firebaseConfig</strong> object.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Firebase Config (JSON)</label>
            <textarea 
              value={configStr}
              onChange={(e) => setConfigStr(e.target.value)}
              placeholder='{ "apiKey": "...", "projectId": "...", ... }'
              className="w-full h-48 p-4 font-mono text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSettings;
