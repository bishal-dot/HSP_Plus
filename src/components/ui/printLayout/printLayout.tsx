'use client';

import React from 'react';

export interface PatientInfo {
  name: string;
  patientId: string;
  age: string;
  gender: string;
  contact?: string;
  address?: string;
}

export interface HospitalInfo {
  name: string;
  logo?: string;        // Optional
  address?: string;     // Optional
  phone?: string;       // Optional
  email?: string;       // Optional
}

interface PrintLayoutProps {
  documentType: string;           // e.g., "BILL", "PRESCRIPTION", "DISCHARGE SUMMARY"
  hospitalInfo: HospitalInfo;
  patientInfo: PatientInfo;
  date: string;
  children: React.ReactNode;      // Fully dynamic body
  footerNote?: string;
  copyrightText?: string;         // Optional custom copyright
}

const PrintLayout: React.FC<PrintLayoutProps> = ({
  documentType,
  hospitalInfo,
  patientInfo,
  date,
  children,
  footerNote,
  copyrightText = "© 2026 INF NEPAL. All Rights Reserved.",
}) => {
  return (
    <div
      id="print-content"
      className="print-container mx-auto bg-white text-sm leading-relaxed text-black shadow-md"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 12mm', // Inner padding for better look
      }}
    >
      {/* ==================== HEADER ==================== */}
      <header className="border-b-2 border-gray-800 pb-6 mb-8">
        <div className="flex justify-between items-start">
          {/* Hospital Logo + Info (All Optional except Name) */}
          <div className="flex items-center gap-4">
            {hospitalInfo.logo && (
              <img
                src={hospitalInfo.logo}
                alt="Hospital Logo"
                className="h-16 w-auto object-contain"
              />
            )}

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {hospitalInfo.name}
              </h1>

              {hospitalInfo.address && (
                <p className="text-xs text-gray-600 mt-1">{hospitalInfo.address}</p>
              )}

              {(hospitalInfo.phone || hospitalInfo.email) && (
                <p className="text-xs text-gray-600">
                  {hospitalInfo.phone && `☎ ${hospitalInfo.phone}`}
                  {hospitalInfo.phone && hospitalInfo.email && ' | '}
                  {hospitalInfo.email && `📧 ${hospitalInfo.email}`}
                </p>
              )}
            </div>
          </div>

          {/* Document Type & Date */}
          <div className="text-right">
            <div className="inline-block border-2 border-gray-900 px-8 py-2 text-2xl font-bold uppercase tracking-widest">
              {documentType}
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700">
              Date: {date}
            </p>
          </div>
        </div>

        {/* Patient Information Bar */}
        <div className="mt-8 grid grid-cols-4 md:grid-cols-4 gap-4 border border-gray-300 bg-white p-5 text-xs rounded">
          <div>
            <span className="font-semibold text-gray-700">Patient Name:</span><br />
            {patientInfo.name}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Patient ID:</span><br />
            {patientInfo.patientId}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Age / Gender:</span><br />
            {patientInfo.age} / {patientInfo.gender}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Contact:</span><br />
            {patientInfo.contact || patientInfo.address || '—'}
          </div>
        </div>
      </header>

      {/* ==================== DYNAMIC BODY ==================== */}
      <main className="print-body min-h-[180mm] mb-12">
        {children}
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t-2 border-gray-800 pt-6 text-xs">
        {/* Copyright */}
        <div className="text-center mt-10 text-[10px] text-gray-500 border-t border-gray-300 pt-4">
          {copyrightText}
        </div>
      </footer>
    </div>
  );
};

export default PrintLayout;