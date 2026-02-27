"use client";

import {
  Stethoscope,
  User,
  FlaskConical,
  Pill,
  Scan,
  ClipboardList,
  FileText,
  Phone,
  ArrowRightLeft,
  NotebookIcon,
  ReceiptText,
  ReceiptIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import PreviousConsultantNotes from "./ConsultantNotesHistory";
import PrescriptionForm from "./PrescriptionForm";
import LaboratoryRecords from "./LaboratoryRecords";
import ImagingRecords from "./ImagingRecords";
import PatientClinicalRecordPage from "./PatientCase";

import { useAuthToken } from "@/context/AuthContext";
import SsdReferToPatientPage from "@/app/(admin)/ssd-estimate/components/SsdReferToPatientPage";
import ServiceComponent from "./ServiceNotes";
import ProgressNotePage from "./ProgressNote";
import BillDetailsPage from "./BillDetails";
import IPDOperationRecords from "./IPDOperationRecords";

/* ========================================================= */

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
  ;

/* ========================================================= */

const ConsultantNotes: React.FC = () => {
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
    <div className="min-h-screen space-y-6">
      {/* ================= Header ================= */}
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
              value={patientInfo?.ConsultingDoctor || patientInfo?.BlockedBy  || "-"}
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
            <ToolbarIcon
              label="Prescription"
              icon={<Pill className="w-5 h-5" />}
              active={activeTab === "prescription"}
              onClick={() => handleTabClick("prescription")}
            />
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
            <ToolbarIcon
              label="Patient Case"
              icon={<ClipboardList className="w-5 h-5" />}
              active={activeTab === "patient-case"}
              onClick={() => handleTabClick("patient-case")}
            />
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
              label="Refer SSD"
              icon={<ArrowRightLeft className="w-5 h-5" />}
              active={activeTab === "referssd"}
              onClick={() => {
                if(!patientInfo?.PatientCode) return;
                const regCode = getPatientRegCode(patientInfo);
                if(!regCode) return;

                sessionStorage.setItem("selectedPatient", JSON.stringify(patientInfo));
                router.push(`/ssd-estimate/${patientInfo.PatientCode}/${regCode}`);
            }}
            />
          </div>
        </div>
      </div>

      {/* ================= Main Content ================= */}
      {!activeTab && patientId && (
        <ConsultantNotesForm existingNotes={null} router={router} />
      )}

      {activeTab === "consultant-notes" && patientId && (
        showHistory ? (
          <PreviousConsultantNotes
            patientCode={patientId}
            onCreateNew={() => setShowHistory(false)}
          />
        ) : (
          <ConsultantNotesForm existingNotes={null} router={router} />
        )
      )}

      {activeTab === "prescription" && patientId && (
        <PrescriptionForm patientCode={patientInfo.MRNo} />
      )}

      {activeTab === "services" && patientId && (
        <ServiceComponent Patientcode={patientInfo.PatientCode} />
      )}

      {activeTab === "imaging" && patientId && (
        <ImagingRecords Patientcode={patientInfo.PatientCode} />
      )}

      {activeTab === "laboratory" && patientId && (
        <LaboratoryRecords Patientcode={patientInfo.PatientCode} />
      )}

      {activeTab === "patient-case" && patientId &&
      <PatientClinicalRecordPage Patientcode={patientInfo.MRNo}/>}

      {activeTab === "progress-note" && patientId && (
        <ProgressNotePage  PatientCode={patientInfo.PatientCode} />
      )}

      {activeTab === "bill-details" && patientId && (
        <BillDetailsPage PatientCode={patientInfo.IPDCODE} />
      )}

      {activeTab === "operation-records" && patientId && (
        <IPDOperationRecords  />
      )}

      {activeTab === "referssd" &&  patientId && (
        <SsdReferToPatientPage patientInfo={patientInfo} />
      )}
    </div>
  );
};


interface FormProps {
  existingNotes: any;
  router?: any;
}

const ConsultantNotesForm: React.FC<FormProps> = ({ existingNotes, router }) => {
  const [formData, setFormData] = useState<any>({
    chiefComplaint: existingNotes?.history?.chiefComplaint || "",
    hopi: existingNotes?.history?.hopi || "",
    pastHistory: existingNotes?.history?.pastHistory || "",
    personalHistory: existingNotes?.history?.personalHistory || "",
    medicalHistory: existingNotes?.history?.medicalHistory || "",
    allergies: existingNotes?.history?.allergies || "",
    generalCondition: existingNotes?.examination?.generalCondition || "",
    pr: existingNotes?.examination?.vitals?.pr || "",
    rr: existingNotes?.examination?.vitals?.rr || "",
    bp: existingNotes?.examination?.vitals?.bp || "",
    spo2: existingNotes?.examination?.vitals?.spo2 || "",
    temperature: existingNotes?.examination?.vitals?.temperature || "",
    crt: existingNotes?.examination?.vitals?.crt || "",
    rs: existingNotes?.examination?.rs || "",
    cvs: existingNotes?.examination?.cvs || "",
    pa: existingNotes?.examination?.pa || "",
    cns: existingNotes?.examination?.cns || "",
    others: existingNotes?.examination?.others || "",
    diagnosis: existingNotes?.assessment?.diagnosis || "",
    icdCode: existingNotes?.assessment?.icdCode || "",
    advice: existingNotes?.assessment?.advicePlan || "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const patientInfo = JSON.parse(sessionStorage.getItem("selectedPatient") || "{}");

      const response = await fetch("/api/patient/consultant-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientCode: patientInfo?.PatientCode,
          regCode: patientInfo?.TokenNo,
          consultantCode: patientInfo?.ConsultantCode,
          deptCode: patientInfo?.DeptCode,
          userId: patientInfo?.UserId,
          formData,
        }),
      });

      const result = await response.json();
      console.log("Data is", result);
      if (result.success) alert("Notes added successfully!");
      else alert("Failed to save notes");
    } catch (e) {
      alert("Something went wrong");
    }
  };

  return (
    <>
      {/* ================= History ================= */}
      <Section title="History">
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { label: "Chief Complaint", key: "chiefComplaint" },
            { label: "History of Present Illness", key: "hopi" },
            { label: "Past History", key: "pastHistory" },
            { label: "Personal History", key: "personalHistory" },
            { label: "Medical History", key: "medicalHistory" },
            { label: "Allergies", key: "allergies" },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <textarea
                value={formData[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                className="input-area"
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ================= Examination ================= */}
      <Section title="Examination">
        <Field label="General Condition">
          <input
            type="text"
            value={formData.generalCondition}
            onChange={e => handleChange("generalCondition", e.target.value)}
            className="input-field"
          />
        </Field>
        <div className="space-y-3 border-gray-200">
          <label htmlFor="" className="font-semibold">Vitals</label>
          <div className="grid md:grid-cols-6 gap-4 border-t border-gray-200 pt-4">
            {["pr", "rr", "bp", "spo2", "temperature", "crt"].map(v => (
              <Field key={v} label={v.toUpperCase()}>
                <input
                  type="text"
                  value={formData[v]}
                  onChange={e => handleChange(v, e.target.value)}
                  className="input-field text-center"
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {["rs", "cvs", "pa", "cns", "others"].map(exam => (
            <Field key={exam} label={exam.toUpperCase()}>
              <textarea
                value={formData[exam]}
                onChange={e => handleChange(exam, e.target.value)}
                className="input-area"
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ================= Assessment & Plan ================= */}
      <Section title="Assessment & Plan">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Diagnosis">
            <input
              type="text"
              value={formData.diagnosis}
              onChange={e => handleChange("diagnosis", e.target.value)}
              className="input-field"
            />
          </Field>

          <Field label="ICD Code">
            <input
              type="text"
              value={formData.icdCode}
              onChange={e => handleChange("icdCode", e.target.value)}
              className="input-field"
            />
          </Field>
        </div>

        <Field label="Advice / Plan">
          <textarea
            value={formData.advice}
            onChange={e => handleChange("advice", e.target.value)}
            className="input-area min-h-120px"
          />
        </Field>
      </Section>

      {/* ================= Actions ================= */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router?.push(`/dashboard/`)}
          className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
        >
          {existingNotes ? "Update Notes" : "Save Notes"}
        </button>
      </div>
    </>
  );
};

/* ========================================================= */
/* ================= Reusable UI ============================ */
/* ========================================================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-800">
          {title}
        </h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
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

export default ConsultantNotes;
