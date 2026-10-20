import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Folder, 
  FileCode, 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  Terminal, 
  Smartphone 
} from 'lucide-react';
import { ANDROID_SOURCE_FILES, SourceFile } from '../data/androidSourceFiles';
import { generateAndroidProjectZip, triggerDownload } from '../utils/zipExporter';

interface AndroidProjectViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidProjectViewerModal: React.FC<AndroidProjectViewerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(ANDROID_SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const blob = await generateAndroidProjectZip();
      triggerDownload(blob, 'StTV_Android_TV_Project.zip');
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14181D] border border-white/10 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0E1217]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">StTV — Native Kotlin Android TV Project (TX9 Pro)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                  com.sttv.iptv
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Jetpack Compose TV • Media3 ExoPlayer • Room SQLite • WorkManager • Telegram Bot API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
            >
              <Download className={`w-4 h-4 ${isExportingZip ? 'animate-bounce' : ''}`} />
              {isExportingZip ? 'তৈরি হচ্ছে (.ZIP)…' : 'Download Android Studio Project (.ZIP)'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Tree (Left) */}
          <div className="w-72 border-r border-white/10 bg-[#0E1217]/60 flex flex-col overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Project Explorer</span>
              <span className="font-mono text-[10px] text-slate-500">{ANDROID_SOURCE_FILES.length} Files</span>
            </div>

            {ANDROID_SOURCE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}

            {/* Build Guide Card in Sidebar */}
            <div className="mt-auto p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Build Command
              </span>
              <code className="block bg-black/60 p-1.5 rounded text-[10px] text-emerald-400 font-mono">
                ./gradlew assembleDebug
              </code>
              <span>Output APK ready to sideload on TX9 Pro via ADB or USB!</span>
            </div>
          </div>

          {/* Code Viewer Panel (Right) */}
          <div className="flex-1 flex flex-col bg-[#0B0D10] overflow-hidden">
            {/* File Path Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#14181D]/80">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <Folder className="w-4 h-4 text-sky-400" />
                <span className="text-slate-500">StTV /</span>
                <span className="text-white font-semibold">{selectedFile.path}</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'কপি হয়েছে!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200 select-text">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
