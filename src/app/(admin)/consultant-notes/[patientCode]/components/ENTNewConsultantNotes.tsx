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
  Ear,
  Save,
  Printer,
  ActivityIcon,
  Activity,
  Eye,
  Check,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect} from "react";

import PreviousConsultantNotes from "./ConsultantNotesHistory";
import PrescriptionForm from "./PrescriptionForm";
import LaboratoryRecords from "./LaboratoryRecords";
import ImagingRecords from "./ImagingRecords";
import PatientClinicalRecordPage from "./PatientCase";

import { useAuthToken } from "@/context/AuthContext";
import SsdReferToPatientPage from "@/app/(admin)/ssd-estimate/components/SsdReferToPatientPage";
import ServiceComponent from "./ServiceNotes";

/* ========================================================= */

type TabKey =
  | "consultant-notes"
  | "prescription"
  | "imaging"
  | "laboratory"
  | "patient-case"
  | "services"
  | "referssd";

  
interface Procedures { syringingR: boolean; syringingL: boolean; microscopeExam: boolean; nasoendoscopy: boolean; }
interface AudiologyTests { ptAudio: boolean; tympanometry: boolean; stapedialReflexes: boolean; speechAudio: boolean; oae: boolean; abr: boolean; vestibularTest: boolean; }
interface AudiologyTreatment { hearingAid: boolean; hearingAidReview: boolean; hearingTinnitusRehab: boolean; speechLanguage: boolean; assessmentRehab: boolean; }
interface Diagnosis { csom: string; squamousAA: string; unclassified: string; vertigoBalance: string; tinnitus: string; other: string; }


/* ========================================================= */

const ENTConsultantNotes: React.FC = () => {
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

  const handleTabClick = (tab: TabKey) => {
    if (!patientInfo?.PatientCode) return;
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
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 space-y-4">
          {/* Patient Info */}
          <div className="grid lg:grid-cols-7 md:grid-cols-4 gap-4">
            <Info
              label="Patient Code"
              value={patientInfo?.PatientCode || "-"}
              icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
            />
            <Info
              label="Patient"
              value={
                patientInfo
                  ? `${patientInfo.FirstName} ${patientInfo.LastName}`
                  : "-"
              }
              icon={<User className="w-5 h-5 text-blue-600" />}
            />
            <Info
              label="Age / Sex"
              value={
                patientInfo ? `${patientInfo.Age} / ${patientInfo.Sex}` : "-"
              }
            />
            <Info
              label="Department"
              value={patientInfo?.FacultyName || "-"}
            />
            <Info
              label="Consultant"
              value={patientInfo?.consultant || "-"}
            />
            <Info
              label="Phone"
              value={patientInfo?.Mobile || "-"}
              icon={<Phone className="w-5 h-5 text-blue-600" />}
            />
            <Info 
              label="Token No"
              value={patientInfo?.TokenNo || "-"} />
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
              label="Refer SSD"
              icon={<ArrowRightLeft className="w-5 h-5" />}
              active={activeTab === "services"}
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
      {!activeTab && patientInfo?.PatientCode && (
        <ENTConsultantNotesForm existingNotes={null} router={router} />
      )}

      {activeTab === "consultant-notes" && patientInfo?.PatientCode && (
        showHistory ? (
          <PreviousConsultantNotes
            patientCode={patientInfo.PatientCode}
            onCreateNew={() => setShowHistory(false)}
          />
        ) : (
          <ENTConsultantNotesForm existingNotes={null} router={router} />
        )
      )}

      {activeTab === "prescription" && patientInfo?.PatientCode && (
        <PrescriptionForm patientCode={patientInfo.PatientCode} />
      )}

      {activeTab === "services" && patientInfo?.PatientCode && (
        <ServiceComponent Patientcode={patientInfo.PatientCode} />
      )}

      {activeTab === "imaging" && patientInfo?.PatientCode && (
        <ImagingRecords Patientcode={patientInfo.PatientCode} />
      )}

      {activeTab === "laboratory" && patientInfo?.PatientCode && (
        <LaboratoryRecords Patientcode={patientInfo.PatientCode} />
      )}

      {activeTab === "patient-case" && patientInfo?.PatientCode &&
      <PatientClinicalRecordPage Patientcode={patientInfo.PatientCode}/>}

      {activeTab === "referssd" &&  patientInfo?.PatientCode && (
        <SsdReferToPatientPage patientInfo={patientInfo} />
      )}
    </div>
  );
};


interface FormProps {
  existingNotes: any;
  router?: any;
}
const ENTConsultantNotesForm: React.FC<FormProps> = ({ existingNotes, router }) => {
  const [presentComplaint, setPresentComplaint] = useState('');
  const [procedures, setProcedures] = useState<Procedures>({ syringingR:false, syringingL:false, microscopeExam:false, nasoendoscopy:false });
  const [audiologyTests, setAudiologyTests] = useState<AudiologyTests>({
    ptAudio:false, tympanometry:false, stapedialReflexes:false, speechAudio:false, oae:false, abr:false, vestibularTest:false
  });
  const [examination, setExamination] = useState({ rightEar:'', leftEar:'', rightNose:'', leftNose:'' });
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [audiologyTreatment, setAudiologyTreatment] = useState<AudiologyTreatment>({
    hearingAid:false, hearingAidReview:false, hearingTinnitusRehab:false, speechLanguage:false, assessmentRehab:false
  });
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({ csom:'', squamousAA:'', unclassified:'', vertigoBalance:'', tinnitus:'', other:'' });
  const [treatmentPlan, setTreatmentPlan] = useState(['','','','']);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {  presentComplaint, procedures, audiologyTests, examination, pastMedicalHistory, audiologyTreatment, diagnosis, treatmentPlan, notes };
    console.log('Form Data:', formData);
    alert("Consultant notes saved!");
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-full space-y-6">

       {/* Present Complaint and Procedures */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Present Complaint */}
              <div>
                <Label htmlFor="presentComplaint" className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-blue-600" />
                  Present Complaint
                </Label>
                <Textarea
                  id="presentComplaint"
                  value={presentComplaint}
                  onChange={(e:any) => setPresentComplaint(e.target.value)}
                  placeholder="Describe the present complaint..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* Procedures */}
              <div>
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-blue-600" />
                  Procedure
                </Label>
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="syringingR"
                      checked={procedures.syringingR}
                      onCheckedChange={(checked:any) =>
                        setProcedures({ ...procedures, syringingR: checked as boolean })
                      }
                    />
                    <Label htmlFor="syringingR" className="cursor-pointer mb-0">
                      Syringing R/L (Wax drops First, if __day)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="microscopeExam"
                      checked={procedures.microscopeExam}
                      onCheckedChange={(checked: any) =>
                        setProcedures({ ...procedures, microscopeExam: checked as boolean })
                      }
                    />
                    <Label htmlFor="microscopeExam" className="cursor-pointer mb-0">
                      Micro-scope exam (MSE)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nasoendoscopy"
                      checked={procedures.nasoendoscopy}
                      onCheckedChange={(checked:boolean) =>
                        setProcedures({ ...procedures, nasoendoscopy: checked as boolean })
                      }
                    />
                    <Label htmlFor="nasoendoscopy" className="cursor-pointer mb-0">
                      Nasoendoscopy (NE)
                    </Label>
                  </div>
                </div>

                {/* Audiology Investigations */}
                <Label className="text-lg font-semibold mt-6 mb-3 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  Audiology Investigations
                </Label>
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ptAudio"
                      checked={audiologyTests.ptAudio}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({ ...audiologyTests, ptAudio: checked as boolean })
                      }
                    />
                    <Label htmlFor="ptAudio" className="cursor-pointer mb-0">
                      PT Audio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tympanometry"
                      checked={audiologyTests.tympanometry}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({ ...audiologyTests, tympanometry: checked as boolean })
                      }
                    />
                    <Label htmlFor="tympanometry" className="cursor-pointer mb-0">
                      Tympanometry
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stapedialReflexes"
                      checked={audiologyTests.stapedialReflexes}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({
                          ...audiologyTests,
                          stapedialReflexes: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="stapedialReflexes" className="cursor-pointer mb-0">
                      Stapedial reflexes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="speechAudio"
                      checked={audiologyTests.speechAudio}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({ ...audiologyTests, speechAudio: checked as boolean })
                      }
                    />
                    <Label htmlFor="speechAudio" className="cursor-pointer mb-0">
                      Speech audio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oae"
                      checked={audiologyTests.oae}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({ ...audiologyTests, oae: checked as boolean })
                      }
                    />
                    <Label htmlFor="oae" className="cursor-pointer mb-0">
                      OAE
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="abr"
                      checked={audiologyTests.abr}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({ ...audiologyTests, abr: checked as boolean })
                      }
                    />
                    <Label htmlFor="abr" className="cursor-pointer mb-0">
                      ABR
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vestibularTest"
                      checked={audiologyTests.vestibularTest}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTests({
                          ...audiologyTests,
                          vestibularTest: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="vestibularTest" className="cursor-pointer mb-0">
                      VESTIBULAR FUNCTION TESTS
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={24} className="text-blue-600" />
              Examination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ear Examination Diagram */}
              <div>
                <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Ear size={20} className="text-blue-600" />
                  Ear Examination
                </Label>
                <div className="flex justify-around items-center mb-4">
                  <div className="text-center">
                    <div className="w-32 h-32 border-4 border-gray-800 rounded-full mb-2 flex items-center justify-center bg-gray-50">
                      <Ear size={48} className="text-gray-300" />
                    </div>
                    <div className="text-sm font-semibold">R</div>
                    <Input
                      value={examination.rightEar}
                      onChange={(e:any) =>
                        setExamination({ ...examination, rightEar: e.target.value })
                      }
                      placeholder="VII"
                      className="mt-2 w-32"
                    />
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 border-4 border-gray-800 rounded-full mb-2 flex items-center justify-center bg-gray-50">
                      <Ear size={48} className="text-gray-300" />
                    </div>
                    <div className="text-sm font-semibold">L</div>
                    <Input
                      value={examination.leftEar}
                      onChange={(e:any) =>
                        setExamination({ ...examination, leftEar: e.target.value })
                      }
                      placeholder="512"
                      className="mt-2 w-32"
                    />
                  </div>
                </div>
                <div className="flex justify-around mt-4">
                  <div className="text-center">
                    <Label>R</Label>
                    <Input
                      value={examination.rightNose}
                      onChange={(e:any) =>
                        setExamination({ ...examination, rightNose: e.target.value })
                      }
                      placeholder="Nose R"
                      className="mt-2 w-32"
                    />
                  </div>
                  <div className="text-center">
                    <Label>L</Label>
                    <Input
                      value={examination.leftNose}
                      onChange={(e:any) =>
                        setExamination({ ...examination, leftNose: e.target.value })
                      }
                      placeholder="Nose L"
                      className="mt-2 w-32"
                    />
                  </div>
                </div>
              </div>

              {/* Audiology Treatment */}
              <div>
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-blue-600" />
                  Audiology Treatment
                </Label>
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hearingAid"
                      checked={audiologyTreatment.hearingAid}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTreatment({
                          ...audiologyTreatment,
                          hearingAid: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="hearingAid" className="cursor-pointer mb-0">
                      Hearing aid
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hearingAidReview"
                      checked={audiologyTreatment.hearingAidReview}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTreatment({
                          ...audiologyTreatment,
                          hearingAidReview: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="hearingAidReview" className="cursor-pointer mb-0">
                      Hearing aid review/repair
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hearingTinnitusRehab"
                      checked={audiologyTreatment.hearingTinnitusRehab}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTreatment({
                          ...audiologyTreatment,
                          hearingTinnitusRehab: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="hearingTinnitusRehab" className="cursor-pointer mb-0">
                      Hearing/tinnitus rehab.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="speechLanguage"
                      checked={audiologyTreatment.speechLanguage}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTreatment({
                          ...audiologyTreatment,
                          speechLanguage: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="speechLanguage" className="cursor-pointer mb-0">
                      Speech and language
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assessmentRehab"
                      checked={audiologyTreatment.assessmentRehab}
                      onCheckedChange={(checked: any) =>
                        setAudiologyTreatment({
                          ...audiologyTreatment,
                          assessmentRehab: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="assessmentRehab" className="cursor-pointer mb-0">
                      Assessment/rehab.
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Past Medical History and Main Diagnosis */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Past Medical History */}
              <div>
                <Label htmlFor="pastMedicalHistory" className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Past Medical History
                </Label>
                <Textarea
                  id="pastMedicalHistory"
                  value={pastMedicalHistory}
                  onChange={(e:any) => setPastMedicalHistory(e.target.value)}
                  placeholder="Past medical history..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* Main Diagnosis */}
              <div>
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-600" />
                  Main Diagnosis (for each ear, R/L/Bilat.)
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="csom" className="text-sm">
                      CSOM: Mucosal/TT (dry/moist/wet)
                    </Label>
                    <Input
                      id="csom"
                      value={diagnosis.csom}
                      onChange={(e:any) => setDiagnosis({ ...diagnosis, csom: e.target.value })}
                      placeholder="Mucosal/TT (dry/moist/wet)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="squamousAA" className="text-sm">
                      Squamous/AA (Dry/Moist/Wet)
                    </Label>
                    <Input
                      id="squamousAA"
                      value={diagnosis.squamousAA}
                      onChange={(e:any) => setDiagnosis({ ...diagnosis, squamousAA: e.target.value })}
                      placeholder="Dry/Moist/Wet"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unclassified" className="text-sm">
                      Unclassified
                    </Label>
                    <Input
                      id="unclassified"
                      value={diagnosis.unclassified}
                      onChange={(e:any) => setDiagnosis({ ...diagnosis, unclassified: e.target.value })}
                      placeholder="Unclassified"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vertigoBalance" className="text-sm">
                      Vertigo/Balance
                    </Label>
                    <Input
                      id="vertigoBalance"
                      value={diagnosis.vertigoBalance}
                      onChange={(e:any) =>
                        setDiagnosis({ ...diagnosis, vertigoBalance: e.target.value })
                      }
                      placeholder="Vertigo/Balance"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tinnitus" className="text-sm">
                      Tinnitus
                    </Label>
                    <Input
                      id="tinnitus"
                      value={diagnosis.tinnitus}
                      onChange={(e:any) => setDiagnosis({ ...diagnosis, tinnitus: e.target.value })}
                      placeholder="Tinnitus"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diagnosisOther" className="text-sm">
                      Other
                    </Label>
                    <Input
                      id="diagnosisOther"
                      value={diagnosis.other}
                      onChange={(e:any) => setDiagnosis({ ...diagnosis, other: e.target.value })}
                      placeholder="Other diagnosis"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Plan and Notes */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Treatment Plan */}
              <div>
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-600" />
                  Treatment Plan
                </Label>
                <div className="space-y-3">
                  {treatmentPlan.map((plan, index) => (
                    <div key={index}>
                      <Label htmlFor={`treatment${index + 1}`} className="text-sm">
                        {index + 1}.
                      </Label>
                      <Input
                        id={`treatment${index + 1}`}
                        value={plan}
                        onChange={(e:any) => {
                          const newPlan = [...treatmentPlan];
                          newPlan[index] = e.target.value;
                          setTreatmentPlan(newPlan);
                        }}
                        placeholder={`Treatment step ${index + 1}`}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e:any) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={10}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" icon={Printer} onClick={() => window.print()}>Print</Button>
        <Button type="submit" icon={Save}>Save Consultant Notes</Button>
      </div>
    </form>
  </>
  );
}


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
      } hover:bg-gray-100 transition`}
    >
      {icon}
      <span className="text-[11px] text-gray-600 mt-1">
        {label}
      </span>
    </button>
  );
}
const Button = ({ children, className = '', variant = 'primary', icon: Icon, ...props }:(any)) => {
  const baseClasses = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium flex items-center gap-2 justify-center';
  const variantClasses = variant === 'outline' 
    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

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
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
const Card = ({ children, className = '' }:(any)) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }:(any)) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }:(any)) => <h3 className={`text-2xl font-semibold text-gray-900 ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }:(any)) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Label = ({ children, htmlFor, className = '' }:(any)) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>{children}</label>
);

const Input = ({ className = '', icon: Icon, ...props }:(any)) => (
  <div className="relative">
    {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={18} /></div>}
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${Icon ? 'pl-10' : ''} ${className}`}
      {...props}
    />
  </div>
);

const Checkbox = ({ checked, onCheckedChange, id, className = '' }:(any)) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white'} ${className}`}
    id={id}
  >
    {checked && <Check size={14} className="text-white" />}
  </button>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    {...props}
  />
);

export default ENTConsultantNotes;
