import React from 'react';
import { X, Download, Smartphone, Monitor, Share2, PlusSquare, CheckCircle2, ArrowRight } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallDirect: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallDirect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <Download className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">&lt;/AdvocoDe&gt; PWA App</h3>
              <p className="text-xs text-blue-100 font-medium">Install to your device for standalone offline access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1 text-slate-700 dark:text-slate-300">
          
          {/* Direct Install Button if Native Prompt Available */}
          {deferredPrompt ? (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ready for Instant Installation</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Your browser supports 1-click standalone PWA installation!</p>
              </div>
              <button
                onClick={onInstallDirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> Install &lt;/AdvocoDe&gt; App Now
              </button>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200">How to install on your device</p>
                <p className="text-amber-700 dark:text-amber-300/80 mt-0.5">Follow the quick instructions below depending on your browser and operating system:</p>
              </div>
            </div>
          )}

          {/* Device Specific Guides */}
          <div className="space-y-4">
            
            {/* iOS Safari */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 dark:text-white">
                <Share2 className="w-4 h-4 text-blue-500" />
                <span>iPhone & iPad (iOS Safari)</span>
              </div>
              <ol className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-decimal list-inside pl-1 font-medium">
                <li>Tap the <span className="font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Share <Share2 className="w-3 h-3" /></span> button at the bottom of Safari.</li>
                <li>Scroll down the share menu and select <span className="font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Add to Home Screen <PlusSquare className="w-3 h-3 text-blue-500" /></span>.</li>
                <li>Tap <span className="font-bold text-blue-600 dark:text-blue-400">Add</span> in the top right corner!</li>
              </ol>
            </div>

            {/* Android Chrome / Edge */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-green-500" />
                <span>Android (Chrome & Edge)</span>
              </div>
              <ol className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-decimal list-inside pl-1 font-medium">
                <li>Tap the browser menu <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">(3 dots ⋮)</span> in the top right corner.</li>
                <li>Select <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Install app</span> or <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Add to Home Screen</span>.</li>
                <li>Confirm by tapping <span className="font-bold text-green-600 dark:text-green-400">Install</span>!</li>
              </ol>
            </div>

            {/* Desktop Chrome / Edge */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
              <div className="flex items-center gap-2.5 font-bold text-xs text-slate-900 dark:text-white">
                <Monitor className="w-4 h-4 text-indigo-500" />
                <span>Desktop (PC & Mac Chrome / Edge)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Look for the install icon <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 inline-flex items-center gap-1">🖥️ <ArrowRight className="w-2.5 h-2.5" /> Install</span> on the right side of your browser's top address bar (next to the star/bookmark button), or click menu &rarr; <span className="font-bold">Install &lt;/AdvocoDe&gt;</span>.
              </p>
            </div>

          </div>
          
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Got It, Thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
