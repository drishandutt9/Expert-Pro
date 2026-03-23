'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setStatus('uploading');
    setMessage('Initializing sequential upload...');

    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMessage(`Processing file ${i + 1} of ${files.length}: ${file.name}`);
        
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          successCount++;
        } else {
          console.error(`Failed to upload ${file.name}`);
        }
      }
      
      if (successCount > 0) {
        setStatus('success');
        setMessage(`Successfully processed and vectorized ${successCount} file(s)!`);
        setFiles([]); // clear queue on success
      } else {
         setStatus('error');
         setMessage('Failed to process any files.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Network error.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 -z-10" />
      
      <div className="max-w-xl w-full backdrop-blur-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-white">Upload Knowledge</h1>
        <p className="text-gray-400 mb-8">Upload a PDF or TXT file to vectorize and store in Supabase.</p>
        
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-indigo-400/50 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-12 h-12 text-gray-500 group-hover:text-indigo-400 mb-4 transition-colors" />
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold text-white">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">TXT or PDF (MAX. 10MB per file)</p>
          </div>
          <input type="file" className="hidden" accept=".txt,.pdf" multiple onChange={handleFileChange} />
        </label>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">File Queue ({files.length})</h3>
              <button 
                onClick={handleUpload}
                disabled={status === 'uploading'}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 font-medium rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {status === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process All'}
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-indigo-300">{file.name.split('.').pop()?.toUpperCase() || 'DOC'}</span>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFiles(files.filter((_, index) => index !== i))}
                    disabled={status === 'uploading'}
                    className="text-gray-500 hover:text-red-400 p-2 disabled:opacity-50 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
