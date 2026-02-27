'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelSelectionModal({ onClose }: { onClose: (panel: string) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (panel: 'consultant' | 'patientDoc') => {
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      if (panel === 'consultant') {
        router.push('/dashboard');
      } else {
        router.push('/patientdocument');
      }
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Card */}
      <div
        className={`relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

        <div className="px-8 pt-8 pb-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Select Panel</h2>
            <p className="text-sm text-slate-400 mt-1">Choose where you'd like to go</p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Consultant Panel */}
            <button
              onClick={() => handleSelect('consultant')}
              className="group w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-600 hover:border-blue-600 transition-all duration-200 text-left"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors duration-200">
                <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-white transition-colors duration-200">Consultant Panel</p>
                <p className="text-xs text-slate-400 group-hover:text-blue-100 transition-colors duration-200 mt-0.5">Dashboard & case management</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            {/* Patient Documents */}
            <button
              onClick={() => handleSelect('patientDoc')}
              className="group w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-600 hover:border-emerald-600 transition-all duration-200 text-left"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center transition-colors duration-200">
                <svg className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-white transition-colors duration-200">Patient Documents</p>
                <p className="text-xs text-slate-400 group-hover:text-emerald-100 transition-colors duration-200 mt-0.5">Records, reports & files</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Secure & encrypted access
          </p>
        </div>
      </div>
    </div>
  );
}