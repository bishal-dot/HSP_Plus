"use client";

import { ChevronDown, ChevronUp, User, MapPin, ClipboardList, Microscope, Activity, Users, Save, Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import nepalProvinces from "@/components/data/nepalAddress";
import { Address, District, Municipality, Province } from "@/types/address.types";
import { useAuthToken } from "@/context/AuthContext";
import { PatientCaseFormData } from "@/types/patient.type";

interface props { Patientcode: string }

const emptyAddress: Address = { province: "", district: "", municipality: "", ward: "", tole: "" };

/* ── shared styles ── */
const inputClass = `
  w-full px-2.5 py-1.5 rounded-lg text-xs
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-800
  text-slate-800 dark:text-slate-200
  placeholder:text-slate-300 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-500
  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-700/40
  transition-all duration-150
`;

const PatientClinicalRecordPage: React.FC<props> = ({ Patientcode }) => {
  const { authToken } = useAuthToken();

  const [masterData,        setMasterData]        = useState<any>(null);
  const [permanentAddress,  setPermanentAddress]  = useState<Address>(emptyAddress);
  const [temporaryAddress,  setTemporaryAddress]  = useState<Address>(emptyAddress);
  const [sameAsPermanent,   setSameAsPermanent]   = useState(true);
  const [formData,          setFormData]          = useState<PatientCaseFormData>({ UnkID: Date.now(), PatientCode: Patientcode });

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPatient");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFormData(prev => ({
        ...prev,
        PatientFullName: parsed.PatientName || parsed.PATIENTNAME,
        Age: parsed.Age, Gender: parsed.Sex, ContactNumber: parsed.Mobile,
      }));
    }
  }, []);

  useEffect(() => {
    fetch("/api/masters/patient-case").then(r => r.json()).then(setMasterData).catch(console.error);
  }, []);

  useEffect(() => {
    if (sameAsPermanent) {
      setTemporaryAddress(permanentAddress);
      setFormData(prev => ({
        ...prev,
        TemporaryProvince: permanentAddress.province, TemporaryDistrict: permanentAddress.district,
        TemporaryMunicipality: permanentAddress.municipality, TemporaryWard: permanentAddress.ward,
        TemporaryTole: permanentAddress.tole,
      }));
    }
  }, [permanentAddress, sameAsPermanent]);

  const getDistricts   = (p: string) => nepalProvinces.find(x => x.value === p)?.districts ?? [];
  const getMunicipalities = (p: string, d: string) => getDistricts(p).find(x => x.value === d)?.municipalities ?? [];

  const calculateDisability = (eye?: string, hand?: string, foot?: string, type: "Diagnosis" | "RFT" = "Diagnosis") => {
    const vals = [...(eye?.split(",") || []), ...(hand?.split(",") || []), ...(foot?.split(",") || [])].map(v => Number(v) || 0);
    const ehf = vals.reduce((s, v) => s + v, 0);
    const who = Math.max(...vals);
    if (type === "Diagnosis") setFormData(prev => ({ ...prev, EhfScoreDiagnosis: ehf.toString(), WhoGradingScoreDiagnosis: who.toString() }));
    else setFormData(prev => ({ ...prev, EhfScoreRFT: ehf.toString(), WhoGradingScoreRFT: who.toString() }));
  };

  const handleSave = async (payload?: any) => {
    try {
      const res = await fetch("/api/patient/patientcase", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(formData || payload),
      });
      const data = await res.json();
      if (data.success) {
        alert("Patient Case saved successfully");
        setFormData({ UnkID: Date.now(), PatientCode: Patientcode });
        setPermanentAddress(emptyAddress); setTemporaryAddress(emptyAddress); setSameAsPermanent(true);
      } else alert("Failed: " + data.message);
    } catch (e) { alert("Error saving record"); }
  };

  const fd = formData;
  const sf = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">

      {/* ── Page header ── */}
      <div className="
        relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60
        bg-white dark:bg-slate-900 shadow-sm dark:shadow-none px-5 py-4
      ">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-teal-600" />
        <div className="pl-3">
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">Patient Clinical Record</h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Laboratory, Imaging & Clinical Information</p>
        </div>
      </div>

      {/* ── Basic Information ── */}
      <Accordion icon={<User className="w-4 h-4" />} title="Patient Basic Information" color="emerald" defaultOpen>
        <Grid cols={3}>
          <Field label="Registration Date"><input type="date" className={inputClass} value={fd.RegistrationDate || ""} max={today} onChange={e => sf("RegistrationDate", e.target.value)} /></Field>
          <Field label="Patient Full Name"><input type="text" className={inputClass} value={fd.PatientFullName || ""} onChange={e => sf("PatientFullName", e.target.value)} /></Field>
          <Field label="Guardian's Full Name"><input type="text" className={inputClass} value={fd.PatientGardiansFullName || ""} onChange={e => sf("PatientGardiansFullName", e.target.value)} /></Field>

          <Field label="Is Pregnant">
            <select className={inputClass} value={fd.IsPregnent || ""} onChange={e => sf("IsPregnent", e.target.value)}>
              {masterData?.pregnancyStatus?.map((p: any) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Pregnant Time (weeks)"><input type="text" className={inputClass} value={fd.TimeOfPregnent || ""} onChange={e => sf("TimeOfPregnent", e.target.value)} /></Field>
          <Field label="Ethnic Code">
            <select className={inputClass} value={fd.EthnicCode || ""} onChange={e => sf("EthnicCode", e.target.value)}>
              {masterData?.ethnic?.map((e: any) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </Field>

          <Field label="Age"><input type="text" className={inputClass} value={fd.Age || ""} onChange={e => sf("Age", e.target.value)} /></Field>
          <Field label="Gender"><input type="text" className={inputClass} value={fd.Gender || ""} onChange={e => sf("Gender", e.target.value)} /></Field>
          <Field label="Marital Status">
            <select className={inputClass} value={fd.MaritalStatus || ""} onChange={e => sf("MaritalStatus", e.target.value)}>
              {masterData?.maritalStatus?.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>

          <Field label="Past Occupation"><input type="text" className={inputClass} value={fd.PastOccupation || ""} onChange={e => sf("PastOccupation", e.target.value)} /></Field>
          <Field label="Present Occupation"><input type="text" className={inputClass} value={fd.PresentOccupation || ""} onChange={e => sf("PresentOccupation", e.target.value)} /></Field>
          <Field label="Highest Class Passed (Student)"><input type="text" className={inputClass} value={fd.StudentHighestClassPassed || ""} onChange={e => sf("StudentHighestClassPassed", e.target.value)} /></Field>

          <Field label="Contact Number"><input type="text" className={inputClass} value={fd.ContactNumber || ""} onChange={e => sf("ContactNumber", e.target.value)} /></Field>
          <Field label="Contact Person Name"><input type="text" className={inputClass} value={fd.ContactPersonName || ""} onChange={e => sf("ContactPersonName", e.target.value)} /></Field>
          <Field label="Family Member with Leprosy">
            <select className={inputClass} value={fd.IsAnyMemberWithLeprosy || ""} onChange={e => sf("IsAnyMemberWithLeprosy", e.target.value)}>
              <option value="">Select</option>
              {masterData?.familyLeprosy?.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="SARI Admission Date"><input type="date" className={inputClass} value={fd.SARIAdmissionDate || ""} max={today} onChange={e => sf("SARIAdmissionDate", e.target.value)} /></Field>
        </Grid>
      </Accordion>

      {/* ── Permanent Address ── */}
      <Accordion icon={<MapPin className="w-4 h-4" />} title="Permanent Address" color="blue">
        <Grid cols={5}>
          <Field label="Province">
            <select className={inputClass} value={permanentAddress.province} onChange={e => { setPermanentAddress({ ...emptyAddress, province: e.target.value }); sf("PermanentProvince", e.target.value); }}>
              <option value="">Select Province</option>
              {nepalProvinces.map(p => <option key={p.value} value={p.value}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="District">
            <select className={inputClass} value={permanentAddress.district} disabled={!permanentAddress.province}
              onChange={e => { setPermanentAddress(prev => ({ ...prev, district: e.target.value, municipality: "" })); sf("PermanentDistrict", e.target.value); }}>
              <option value="">Select District</option>
              {getDistricts(permanentAddress.province).map(d => <option key={d.value} value={d.value}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Municipality">
            <select className={inputClass} value={permanentAddress.municipality} disabled={!permanentAddress.district}
              onChange={e => { setPermanentAddress(prev => ({ ...prev, municipality: e.target.value })); sf("PermanentMunicipality", e.target.value); }}>
              <option value="">Select Municipality</option>
              {getMunicipalities(permanentAddress.province, permanentAddress.district).map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Ward No"><input type="text" className={inputClass} value={permanentAddress.ward} onChange={e => { setPermanentAddress(prev => ({ ...prev, ward: e.target.value })); sf("PermanentWard", e.target.value); }} /></Field>
          <Field label="Tole"><input type="text" className={inputClass} value={permanentAddress.tole} onChange={e => { setPermanentAddress(prev => ({ ...prev, tole: e.target.value })); sf("PermanentTole", e.target.value); }} /></Field>
        </Grid>
      </Accordion>

      {/* ── Temporary Address ── */}
      <Accordion icon={<MapPin className="w-4 h-4" />} title="Temporary Address" color="blue">
        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" id="sameAsPerm" checked={sameAsPermanent} onChange={e => setSameAsPermanent(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-emerald-500" />
          <label htmlFor="sameAsPerm" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
            Same as Permanent Address
          </label>
        </div>
        <Grid cols={5}>
          <Field label="Province">
            <select className={inputClass} disabled={sameAsPermanent}
              value={sameAsPermanent ? permanentAddress.province : temporaryAddress.province}
              onChange={e => { const v = e.target.value; setTemporaryAddress({ ...emptyAddress, province: v }); sf("TemporaryProvince", v); }}>
              <option value="">Select Province</option>
              {nepalProvinces.map(p => <option key={p.value} value={p.value}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="District">
            <select className={inputClass}
              disabled={sameAsPermanent || !(sameAsPermanent ? permanentAddress.province : temporaryAddress.province)}
              value={sameAsPermanent ? permanentAddress.district : temporaryAddress.district}
              onChange={e => { const v = e.target.value; setTemporaryAddress(prev => ({ ...prev, district: v, municipality: "" })); sf("TemporaryDistrict", v); }}>
              <option value="">Select District</option>
              {(sameAsPermanent ? getDistricts(permanentAddress.province) : getDistricts(temporaryAddress.province)).map(d => <option key={d.value} value={d.value}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Municipality">
            <select className={inputClass}
              disabled={sameAsPermanent || !(sameAsPermanent ? permanentAddress.district : temporaryAddress.district)}
              value={sameAsPermanent ? permanentAddress.municipality : temporaryAddress.municipality}
              onChange={e => { const v = e.target.value; setTemporaryAddress(prev => ({ ...prev, municipality: v })); sf("TemporaryMunicipality", v); }}>
              <option value="">Select Municipality</option>
              {(sameAsPermanent
                ? getMunicipalities(permanentAddress.province, permanentAddress.district)
                : getMunicipalities(temporaryAddress.province, temporaryAddress.district)
              ).map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Ward No"><input type="text" className={inputClass} disabled={sameAsPermanent}
            value={sameAsPermanent ? permanentAddress.ward : temporaryAddress.ward}
            onChange={e => { setTemporaryAddress(prev => ({ ...prev, ward: e.target.value })); sf("TemporaryWard", e.target.value); }} /></Field>
          <Field label="Tole"><input type="text" className={inputClass} disabled={sameAsPermanent}
            value={sameAsPermanent ? permanentAddress.tole : temporaryAddress.tole}
            onChange={e => { setTemporaryAddress(prev => ({ ...prev, tole: e.target.value })); sf("TemporaryTole", e.target.value); }} /></Field>
        </Grid>
      </Accordion>

      {/* ── Patient Case Type ── */}
      <Accordion icon={<ClipboardList className="w-4 h-4" />} title="Patient Case Type" color="violet">
        <Grid cols={3}>
          {[
            { label: "Type of Cases",           key: "TypeofCase",                  items: masterData?.caseType },
            { label: "RJ Classification",       key: "JD_Classification",           items: masterData?.rjClassification },
            { label: "Mode of Detection",       key: "ModeOfDetection",             items: masterData?.modeOfDetection },
            { label: "Leprosy Treatment Status",key: "TypeOfPatientRegistration",    items: masterData?.treatmentStatus },
            { label: "Today's Major Problem",   key: "TodaysMajorProblem",          items: masterData?.todayMajorProblem },
            { label: "Referred Counselling",    key: "IsRefferedCounsling",         items: masterData?.newCaseReferredCounselling },
            { label: "Nerve Function Assessment",key: "IsNerveFunctionAssesment",   items: masterData?.nerveFunctionAssessment },
            { label: "Type of Lepra Reaction",  key: "TypeOfLepraReaction",         items: masterData?.lepraReaction },
            { label: "Drug Reaction",           key: "DrugReaction",                items: masterData?.drugReaction },
          ].map(({ label, key, items }) => (
            <Field key={key} label={label}>
              <select className={inputClass} value={(fd as any)[key] || ""} onChange={e => sf(key, e.target.value)}>
                <option value="">Select</option>
                {items?.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          ))}

          {[
            { label: "Provide Health Education", key: "IsProvideHealthEducation" },
            { label: "Neuritis",                 key: "IsNeuritis" },
            { label: "Ulcer",                    key: "Ulcer" },
          ].map(({ label, key }) => (
            <Field key={key} label={label}>
              <select className={inputClass} value={(fd as any)[key] || ""} onChange={e => sf(key, e.target.value)}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </Field>
          ))}

          {[
            { label: "Date Reaction Symptoms Noticed",      key: "DateOfReaction" },
            { label: "Date of Starting Treatment (Reaction)", key: "DateOfSTreatmentForReaction" },
            { label: "Date Neuritis",                        key: "DateOfNeuritis" },
            { label: "Date of Starting Treatment (Neuritis)", key: "DateOfStartingTreatmentForNeuritis" },
            { label: "MDT Completion Date",                  key: "MDTCompletionDate" },
          ].map(({ label, key }) => (
            <Field key={key} label={label}>
              <input type="date" className={inputClass} max={today} value={(fd as any)[key] || ""} onChange={e => sf(key, e.target.value)} />
            </Field>
          ))}
        </Grid>
      </Accordion>

      {/* ── Biopsy Information ── */}
      <Accordion icon={<Microscope className="w-4 h-4" />} title="Biopsy Information" color="rose">
        <Grid cols={3}>
          <Field label="Biopsy">
            <select className={inputClass} value={fd.Biopsy || ""} onChange={e => sf("Biopsy", e.target.value)}>
              <option value="">Select</option>
              {masterData?.biopsy?.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Biopsy Result">
            <select className={inputClass} value={fd.BiopsyResult || ""} onChange={e => sf("BiopsyResult", e.target.value)}>
              <option value="">Select</option>
              {masterData?.biopsyResult?.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Skin Smear Date"><input type="date" className={inputClass} max={today} value={fd.SkinSmearDate || ""} onChange={e => sf("SkinSmearDate", e.target.value)} /></Field>

          {[
            { label: "R Ear Lobe", key: "SkinSmearREarLobe" },
            { label: "L Ear Lobe", key: "SkinSmearLEarLobe" },
            { label: "Lesion / R Arm", key: "SkinSmearRArm" },
            { label: "Lesion / L Thigh", key: "SkinSmearLThigh" },
          ].map(({ label, key }) => (
            <Field key={key} label={label}>
              <select className={inputClass} value={(fd as any)[key] || ""} onChange={e => sf(key, e.target.value)}>
                {[0,1,2,3,4,5,6].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
          ))}
        </Grid>
      </Accordion>

      {/* ── Disability Status ── */}
      <Accordion icon={<Activity className="w-4 h-4" />} title="Disability Status" color="amber">
        {/* Diagnosis */}
        <div className="space-y-4">
          <Divider label="WHO Disability Grading — Diagnosis" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: "Eye (Diagnosis)",  keyBase: "EyeDiagnosis"  },
              { title: "Hand (Diagnosis)", keyBase: "HandDiagnosis" },
              { title: "Foot (Diagnosis)", keyBase: "FootDiagnosis" },
            ].map(({ title, keyBase }) => (
              <DisabilityBlock key={keyBase} title={title} color="amber">
                <div className="grid grid-cols-2 gap-2">
                  {["Right", "Left"].map((side, si) => (
                    <Field key={side} label={side}>
                      <input type="text" className={inputClass}
                        value={(fd as any)[keyBase]?.split(",")[si] || ""}
                        onChange={e => {
                          const parts = ((fd as any)[keyBase] || ",").split(",");
                          parts[si] = e.target.value;
                          sf(keyBase, parts.join(","));
                        }} />
                    </Field>
                  ))}
                </div>
              </DisabilityBlock>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Field label="EHF Score (Diagnosis)"><input className={inputClass} disabled value={fd.EhfScoreDiagnosis || ""} readOnly /></Field>
            <Field label="WHO Grading (Diagnosis)"><input className={inputClass} disabled value={fd.WhoGradingScoreDiagnosis || ""} readOnly /></Field>
            <button onClick={() => calculateDisability(fd.EyeDiagnosis, fd.HandDiagnosis, fd.FootDiagnosis, "Diagnosis")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900/40 transition-all duration-150">
              <Calculator className="w-3.5 h-3.5" /> Calculate
            </button>
          </div>

          {/* RFT */}
          <Divider label="WHO Disability Grading — RFT" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: "Eye (RFT)",  keyBase: "EyeRFT"  },
              { title: "Hand (RFT)", keyBase: "HandRFT" },
              { title: "Foot (RFT)", keyBase: "FootRFT" },
            ].map(({ title, keyBase }) => (
              <DisabilityBlock key={keyBase} title={title} color="amber">
                <div className="grid grid-cols-2 gap-2">
                  {["Right", "Left"].map((side, si) => (
                    <Field key={side} label={side}>
                      <input type="text" className={inputClass}
                        value={(fd as any)[keyBase]?.split(",")[si] || ""}
                        onChange={e => {
                          const parts = ((fd as any)[keyBase] || ",").split(",");
                          parts[si] = e.target.value;
                          sf(keyBase, parts.join(","));
                        }} />
                    </Field>
                  ))}
                </div>
              </DisabilityBlock>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Field label="EHF Score (RFT)"><input className={inputClass} disabled value={fd.EhfScoreRFT || ""} readOnly /></Field>
            <Field label="WHO Grading (RFT)"><input className={inputClass} disabled value={fd.WhoGradingScoreRFT || ""} readOnly /></Field>
            <button onClick={() => calculateDisability(fd.EyeRFT, fd.HandRFT, fd.FootRFT, "RFT")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900/40 transition-all duration-150">
              <Calculator className="w-3.5 h-3.5" /> Calculate
            </button>
          </div>
        </div>
      </Accordion>

      {/* ── Contact Tracing ── */}
      <Accordion icon={<Users className="w-4 h-4" />} title="Contact Tracing & Patient Deducted Information" color="teal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Number of Persons",        key: "NoOfDiagnosis" },
            { label: "Contact Number of Person", key: "ContactNoOfPerson" },
            { label: "Name of Contact Examined", key: "NameOfContactExam" },
            { label: "Age/Sex of Contact Person",key: "AgeOrSexOfContactPerson" },
            { label: "Leprosy Diagnosis",        key: "LeprosyDiagnosis" },
            { label: "Way of Deduction",         key: "WayOfDeduction" },
            { label: "CRS Place",                key: "CRSPlace" },
          ].map(({ label, key }) => (
            <Field key={key} label={label}>
              <input type="text" className={inputClass} value={(fd as any)[key] || ""} onChange={e => sf(key, e.target.value)} />
            </Field>
          ))}
          {[
            { label: "Contact Examination Date", key: "ContactExaminationDate" },
            { label: "Deducted Date",            key: "DeductedDate" },
          ].map(({ label, key }) => (
            <Field key={key} label={label}>
              <input type="date" className={inputClass} value={(fd as any)[key] || ""} onChange={e => sf(key, e.target.value)} />
            </Field>
          ))}
          <div className="md:col-span-2">
            <Field label="Remarks">
              <textarea rows={3} className={`${inputClass} resize-none leading-relaxed`} value={fd.Remarks || ""} onChange={e => sf("Remarks", e.target.value)} />
            </Field>
          </div>
        </div>
      </Accordion>

      {/* ── Action bar ── */}
      <div className="
        flex items-center justify-between
        rounded-xl px-5 py-3.5
        bg-slate-50 dark:bg-slate-800/60
        border border-slate-100 dark:border-slate-700
      ">
        <p className="text-xs text-slate-400 dark:text-slate-500">All fields will be saved to the patient's clinical record</p>
        <button
          onClick={() => {
            const payload = {
              ...fd,
              EyeDiagnosis:  fd.EyeDiagnosis?.split(",")  || [],
              HandDiagnosis: fd.HandDiagnosis?.split(",") || [],
              FootDiagnosis: fd.FootDiagnosis?.split(",") || [],
              EyeRFT:        fd.EyeRFT?.split(",")        || [],
              HandRFT:       fd.HandRFT?.split(",")       || [],
              FootRFT:       fd.FootRFT?.split(",")       || [],
              IsNerveFunctionAssesment: Boolean(Number(fd.IsNerveFunctionAssesment)),
              IsPregnent:              Boolean(Number(fd.IsPregnent)),
              IsRefferedCounsling:     Boolean(Number(fd.IsRefferedCounsling)),
              ContactExaminationDate:  isValidDate(fd.ContactExaminationDate) ? fd.ContactExaminationDate : null,
              DateOfNeuritis:          isValidDate(fd.DateOfNeuritis) ? fd.DateOfNeuritis : null,
              DateOfReaction:          isValidDate(fd.DateOfReaction) ? fd.DateOfReaction : null,
              DateOfSTreatmentForReaction: isValidDate(fd.DateOfSTreatmentForReaction) ? fd.DateOfSTreatmentForReaction : null,
              DateOfStartingTreatmentForNeuritis: isValidDate(fd.DateOfStartingTreatmentForNeuritis) ? fd.DateOfStartingTreatmentForNeuritis : null,
              MDTCompletionDate:  isValidDate(fd.MDTCompletionDate)  ? fd.MDTCompletionDate  : null,
              SARIAdmissionDate:  isValidDate(fd.SARIAdmissionDate)  ? fd.SARIAdmissionDate  : null,
              SkinSmearDate:      isValidDate(fd.SkinSmearDate)      ? fd.SkinSmearDate      : null,
              PermanentProvince:    permanentAddress.province,
              PermanentDistrict:    permanentAddress.district,
              PermanentMunicipality:permanentAddress.municipality,
              PermanentWard:        permanentAddress.ward,
              PermanentTole:        permanentAddress.tole,
              TemporaryProvince:    temporaryAddress.province,
              TemporaryDistrict:    temporaryAddress.district,
              TemporaryMunicipality:temporaryAddress.municipality,
              TemporaryWard:        temporaryAddress.ward,
              TemporaryTole:        temporaryAddress.tole,
            };
            handleSave(payload);
          }}
          className="
            inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold
            bg-emerald-600 hover:bg-emerald-700
            dark:bg-emerald-600 dark:hover:bg-emerald-700
            text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40
            transition-all duration-150 active:scale-[0.98]
          "
        >
          <Save className="w-3.5 h-3.5" /> Save Clinical Record
        </button>
      </div>

    </div>
  );
};

export default PatientClinicalRecordPage;

function isValidDate(d: any) { return !isNaN(new Date(d).getTime()); }

/* ── Accordion section ── */
const accentMap: Record<string, { label: string; icon: string; stripe: string; chevron: string }> = {
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", stripe: "from-emerald-500 to-teal-400",  chevron: "text-emerald-400 dark:text-emerald-600" },
  blue:    { label: "text-blue-600 dark:text-blue-400",       icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",       stripe: "from-blue-500 to-sky-400",      chevron: "text-blue-400 dark:text-blue-600"    },
  violet:  { label: "text-violet-600 dark:text-violet-400",   icon: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30", stripe: "from-violet-500 to-purple-400", chevron: "text-violet-400 dark:text-violet-600" },
  rose:    { label: "text-rose-600 dark:text-rose-400",       icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",       stripe: "from-rose-500 to-pink-400",     chevron: "text-rose-400 dark:text-rose-600"    },
  amber:   { label: "text-amber-600 dark:text-amber-400",     icon: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30", stripe: "from-amber-500 to-yellow-400",  chevron: "text-amber-400 dark:text-amber-600"  },
  teal:    { label: "text-teal-600 dark:text-teal-400",       icon: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/30",       stripe: "from-teal-500 to-cyan-400",     chevron: "text-teal-400 dark:text-teal-600"    },
};

function Accordion({ icon, title, color = "emerald", defaultOpen = false, children }: {
  icon: React.ReactNode; title: string; color?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const c = accentMap[color] ?? accentMap.emerald;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className={`h-0.5 w-full bg-gradient-to-r ${c.stripe}`} />
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border ${c.icon}`}>{icon}</span>
          <h2 className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{title}</h2>
        </div>
        {open
          ? <ChevronUp className={`w-4 h-4 ${c.chevron}`} />
          : <ChevronDown className={`w-4 h-4 ${c.chevron}`} />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  const colClass: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 5: "md:grid-cols-5" };
  return <div className={`grid grid-cols-1 ${colClass[cols] || "md:grid-cols-3"} gap-3`}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-amber-100 dark:bg-amber-800/30" />
    </div>
  );
}

function DisabilityBlock({ title, color = "amber", children }: { title: string; color?: string; children: React.ReactNode }) {
  const c = accentMap[color] ?? accentMap.amber;
  return (
    <div className={`rounded-xl border ${c.icon.includes("amber") ? "border-amber-100 dark:border-amber-800/30 bg-amber-50/40 dark:bg-amber-900/10" : "border-slate-200 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40"} p-3`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${c.label}`}>{title}</p>
      {children}
    </div>
  );
}