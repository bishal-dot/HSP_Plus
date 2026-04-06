"use client"

import { useEffect, useState } from "react";
import SsdReferToPatientPage from "../../components/SsdReferToPatientPage";

export default function Page(){
  const [patientInfo, setPatientInfo] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedPatient');
    if(stored) setPatientInfo(JSON.parse(stored));
  },[]);

  if(!patientInfo) return (<div className="min-h-screen flex items-center justify-center">Patient not found!</div>);

  return <SsdReferToPatientPage patientInfo={patientInfo} />
}