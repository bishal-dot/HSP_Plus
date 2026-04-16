"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PatientType = "ipd" | "opd" | null;

type ConsultantContextType = {
  selectedPatient: any;
  patientType: PatientType;
  setSelectedPatient: (patient: any, type: PatientType) => void;
  clearPatient: () => void;
};

const ConsultantContext = createContext<ConsultantContextType | null>(null);

export const ConsultantProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPatient, setSelectedPatientState] = useState<any>(null);
  const [patientType, setPatientType] = useState<PatientType>(null);

  const setSelectedPatient = (patient: any, type: PatientType) => {
    setSelectedPatientState(patient);
    setPatientType(type);

    // optional persistence (safe fallback)
    sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
    sessionStorage.setItem("patientType", type || "");
  };

  const clearPatient = () => {
    setSelectedPatientState(null);
    setPatientType(null);
    sessionStorage.removeItem("selectedPatient");
    sessionStorage.removeItem("patientType");
  };

  return (
    <ConsultantContext.Provider
      value={{
        selectedPatient,
        patientType,
        setSelectedPatient,
        clearPatient,
      }}
    >
      {children}
    </ConsultantContext.Provider>
  );
};

export const useConsultant = () => {
  const ctx = useContext(ConsultantContext);
  if (!ctx) throw new Error("useConsultant must be used inside Provider");
  return ctx;
};