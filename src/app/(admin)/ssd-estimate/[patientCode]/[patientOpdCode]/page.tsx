"use client"

import { useEffect, useState } from "react";
import SsdReferToPatientPage from "../../components/SsdReferToPatientPage";

export default function Page() {
  const [patientInfo, setPatientInfo] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedPatient');
    if (stored) {
      setPatientInfo(JSON.parse(stored));
      // Optional: clear it after reading (to avoid stale data)
      // sessionStorage.removeItem('selectedPatient');
    }
  }, []);

  return <SsdReferToPatientPage patientInfo={patientInfo} />;
}