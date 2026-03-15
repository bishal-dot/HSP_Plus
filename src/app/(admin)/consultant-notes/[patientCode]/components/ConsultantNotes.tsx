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
  LogOut,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";



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

export default ConsultantNotesForm;
