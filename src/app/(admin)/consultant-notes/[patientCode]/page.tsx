"use client";

import ConsultantNotes from "@/app/(admin)/consultant-notes/[patientCode]/components/ConsultantNotes";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuthToken } from "@/context/AuthContext";
import { ArrowRightLeft, ClipboardList, FileText, FlaskConical, LogOut, NotebookIcon, Phone, Pill, ReceiptIcon, ReceiptText, Scan, Stethoscope, User } from "lucide-react";
import SsdReferToPatientPage from "@/app/(admin)/ssd-estimate/components/SsdReferToPatientPage";
import ENTConsultantNotesForm from "./components/ENTNewConsultantNotes";
import ConsultantNotesForm from "@/app/(admin)/consultant-notes/[patientCode]/components/ConsultantNotes";
import { RotatingLines } from "react-loader-spinner";

type TabKey =
  | "consultant-notes"
  | "prescription"
  | "imaging"
  | "laboratory"
  | "patient-case"
  | "services"
  | "referssd"
  | "progress-note"
  | "bill-details"
  | "operation-records"
  | "discharge-summary"
  ;

export default function ConsultantNotesPage() {

  const Loader = () => {
    return(<RotatingLines 
      strokeColor="grey"
      strokeWidth="5"
      animationDuration="0.75"
      width="96"
      visible={true}
    />)
  }

  const PreviousConsultantNotes = dynamic(
      () => import("./components/ConsultantNotesHistory"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const PrescriptionForm = dynamic(
      () => import("./components/PrescriptionForm"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const LaboratoryRecords = dynamic(
      () => import("./components/LaboratoryRecords"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const ImagingRecords = dynamic(
      () => import("./components/ImagingRecords"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const PatientClinicalRecordPage = dynamic(
      () => import("./components/PatientCase"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const ServiceComponent = dynamic(
      () => import("./components/ServiceNotes"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const ProgressNotePage = dynamic(
      () => import("./components/ProgressNote"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const BillDetailsPage = dynamic(
      () => import("./components/BillDetails"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const IPDOperationRecords = dynamic(
      () => import("./components/IPDOperationRecords"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );
  
    const IPDDischargeSummary = dynamic(
      () => import("./components/DischargeSummary"),
      { loading: () => <p className="p-6 flex items-center justify-center mt-20"><Loader /></p> }
    );


   const { patientCode } = useParams<{ patientCode: string }>();
    const { authToken } = useAuthToken();
    const router = useRouter();
  
    const [activeTab, setActiveTab] = useState<TabKey | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [patientInfo, setPatientInfo] = useState<any>(null);
  
    useEffect(() => {
      const stored = sessionStorage.getItem("selectedPatient");
      if (stored) setPatientInfo(JSON.parse(stored));
    }, []);
  
    const patientId = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  
    const patientNo = patientInfo?.TokenNo || patientInfo?.IPDCODE;
  
    const patientType = patientInfo ? (patientInfo.IPDCODE ? "ipd" : "opd") : null;
  
    const isENT = patientInfo?.FacultyName?.toLowerCase().includes("ent") || patientInfo?.wardName === "Ear Ward" || patientInfo?.WARD === "Ear Ward";
  
    const handleTabClick = (tab: TabKey) => {
      if (!patientId) return;
      if (tab !== "consultant-notes") setShowHistory(false);
      setActiveTab(tab);
    };
  
    const getPatientRegCode = (patientInfo: any) => {
      if('TokenNo' in patientInfo && patientInfo.TokenNo) return patientInfo.TokenNo;
      if('IPDCODE' in patientInfo && patientInfo.IPDCODE) return patientInfo.IPDCODE;
      if('Mrno' in patientInfo && patientInfo.Mrno) return patientInfo.Mrno;
      return undefined;
    }

  return (
    
    <div className="min-h-screen px-6 mb-10 mt-5">
      <div className="flex items-center py-4">
        <button
          onClick={() => router.back()}
          className="group flex items-center text-blue-600 hover:text-blue-700 transition-all duration-300 ease-in-out"
        >
          <span className="text-xl font-semibold">←</span>
          
          <span className="ml-2 max-w-0 overflow-hidden group-hover:max-w-xs font-semibold transition-all duration-300 whitespace-nowrap">
            Back
          </span>
        </button>

        <h1 className="text-3xl font-semibold text-slate-800 ml-4">
          Consultant Notes
        </h1>
      </div>

      <div className="rounded-xl border border-gray-200 dark:bg-slate-800 bg-white shadow-sm">
        <div className="p-5 space-y-4">
          {/* Patient Info */}
          <div className="grid lg:grid-cols-7 md:grid-cols-4 gap-4">
            <Info
              label="Patient Code"
              value={patientId || "-"}
              icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
            />
            <Info
              label="Patient"
              value={
                patientInfo
                  ? `${patientInfo.PatientName || patientInfo.PATIENTNAME || patientInfo.patientname} `
                  : "-"
              }
              icon={<User className="w-5 h-5 text-blue-600" />}
            />
            <Info
              label="Age / Sex"
              value={
                patientInfo ? `${patientInfo.Age}` : "-"
              }
            />
            <Info
              label="Department"
              value={patientInfo?.FacultyName || patientInfo?.wardName || "-"}
            />
            <Info
              label="Consultant"
              value={patientInfo?.ConsultingDoctor || patientInfo?.BlockedBy  || patientInfo?.CONSULTANT || "-"}
            />
            <Info
              label="Phone"
              value={patientInfo?.ContactNo ||  patientInfo?.Mobile || "-"}
              icon={<Phone className="w-5 h-5 text-blue-600" />}
            />
            <Info 
              label="Token No"
              value={patientInfo?.TokenNo || patientInfo?.IPDCODE || "-"} />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            <ToolbarIcon
              label="Consultant Notes"
              icon={<FileText className="w-5 h-5" />}
              active={activeTab === "consultant-notes"}
              onClick={() => {
                handleTabClick("consultant-notes");
                setShowHistory(true);
              }}
              dblClick={() => setShowHistory(false)}
            />
            { patientType === "opd" && ( 
              <ToolbarIcon
                label="Prescription"
                icon={<Pill className="w-5 h-5" />}
                active={activeTab === "prescription"}
                onClick={() => handleTabClick("prescription")}
              />
            )}
            <ToolbarIcon
              label="Service"
              icon={<Stethoscope className="w-5 h-5" />}
              active={activeTab === "services"}
              onClick={() => handleTabClick("services")}
            />
            <ToolbarIcon
              label="Imaging"
              icon={<Scan className="w-5 h-5" />}
              active={activeTab === "imaging"}
              onClick={() => handleTabClick("imaging")}
            />
            <ToolbarIcon
              label="Laboratory"
              icon={<FlaskConical className="w-5 h-5" />}
              active={activeTab === "laboratory"}
              onClick={() => handleTabClick("laboratory")}
            />
            { patientType === "opd" && (
              <ToolbarIcon
                label="Patient Case"
                icon={<ClipboardList className="w-5 h-5" />}
                active={activeTab === "patient-case"}
                onClick={() => handleTabClick("patient-case")}
              />
            )}
            { patientType === "ipd" && (
              <>
              <ToolbarIcon 
                label="Progress Note"
                icon={<NotebookIcon className="w-5 h-5" />}
                active={activeTab === "progress-note"}
                onClick={() => handleTabClick("progress-note")}
              />
              <ToolbarIcon
                label="Bill Details"
                icon={<ReceiptText className="w-5 h-5" />}
                active={activeTab === "bill-details"}
                onClick={() => handleTabClick("bill-details")}
              />
              <ToolbarIcon
                label="Operation Records"
                icon={<ReceiptIcon className="w-5 h-5" />}
                active={activeTab === "operation-records"}
                onClick={() => handleTabClick("operation-records")}
              />
              <ToolbarIcon
                label="Discharge Summary"
                icon={<LogOut className="w-5 h-5" />}
                active={activeTab === "discharge-summary"}
                onClick={() => handleTabClick("discharge-summary")}
              />
            </>
            )}
            <ToolbarIcon 
              label="Refer SSD"
              icon={<ArrowRightLeft className="w-5 h-5" />}
              active={activeTab === "referssd"}
              onClick={() => {
                if(!patientId) return;
                const regCode = getPatientRegCode(patientInfo);
                if(!regCode) return;

                sessionStorage.setItem("selectedPatient", JSON.stringify(patientInfo));
                router.push(`/ssd-estimate/${patientInfo.PatientCode}/${regCode}`);
            }}
            />
          </div>
        </div>
      </div>
      <div className="my-5">
          {!activeTab && patientId && (
            isENT ? (
              <ENTConsultantNotesForm existingNotes={null} router={router} />
            ) : (
              <ConsultantNotesForm existingNotes={null} router={router} />
            )
          )} 

          {activeTab === "consultant-notes" && patientId && (
            showHistory ? (
              <PreviousConsultantNotes
                patientCode={patientId}
                onCreateNew={() => setShowHistory(false)}
              />
            ) : (
              isENT ? (
                <ENTConsultantNotesForm existingNotes={null} router={router} />
              ) : (
                <ConsultantNotesForm existingNotes={null} router={router} />
              )
            )
          )}

          {activeTab === "prescription" && patientId && (
            <PrescriptionForm patientCode={patientId} />
          )}

          {activeTab === "services" && patientId && (
            <ServiceComponent Patientcode={patientId} />
          )}

          {activeTab === "imaging" && patientId && (
            <ImagingRecords Patientcode={patientId} />
          )}

          {activeTab === "laboratory" && patientId && (
            <LaboratoryRecords Patientcode={patientId} />
          )}

          {activeTab === "patient-case" && patientId && (
          <PatientClinicalRecordPage Patientcode={patientId}/>)}

          {activeTab === "progress-note" && patientId && (
            <ProgressNotePage  PatientCode={patientId} />
          )}

          {activeTab === "bill-details" && patientId && (
            <BillDetailsPage PatientCode={patientNo} />
          )}

          {activeTab === "operation-records" && patientId && (
            <IPDOperationRecords PatientCode={patientId} />
          )}

          {activeTab === "discharge-summary" && patientId && (
            <IPDDischargeSummary MrNO={patientId} />
          )}

          {activeTab === "referssd" &&  patientId && (
            <SsdReferToPatientPage patientInfo={patientInfo} />
          )}
      </div>
    </div>
  );
}
function ToolbarIcon({
  icon,
  label,
  active,
  onClick,
  dblClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  dblClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onDoubleClick={dblClick}
      className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${
        active ? "border-blue-500 bg-blue-50" : "border-gray-200"
      } hover:bg-gray-100 transition dark:hover:bg-gray-700 dark:border-gray-600 dark:bg-slate-700`}
    >
      {icon}
      <span className="text-[11px] text-gray-600 dark:text-white mt-1">
        {label}
      </span>
    </button>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 items-center">
      {icon}
      <div>
        <p className="text-xs text-gray-800 dark:text-gray-50">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

