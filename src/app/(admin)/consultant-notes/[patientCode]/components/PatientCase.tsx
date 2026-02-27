"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import nepalProvinces from "@/components/data/nepalAddress";
import { Address, District, Municipality, Province } from "@/types/address.types";
import DatePicker from "@/components/form/date-picker";
import { useAuthToken } from "@/context/AuthContext";
import { PatientCaseFormData } from "@/types/patient.type";
import { parse } from "path";
import { set } from "date-fns";

interface props{
  Patientcode: string;
}

const emptyAddress: Address = {
    province: "",
    district: "",
    municipality: "",
    ward: "",
    tole: "",
  }
const PatientClinicalRecordPage: React.FC<props> = ({ Patientcode }) => {

  const { authToken } = useAuthToken();

  console.log("Patientcode", Patientcode);

  const [patientInfo, setPatientInfo] = useState<any>(null);

  const [masterData, setMasterData] = useState<any>(null);

  const [permanentAddress, setPermanentAddress] = useState<Address>(emptyAddress);
  const [temporaryAddress, setTemporaryAddress] = useState<Address>(emptyAddress);
  const [sameAsPermanent, setSameAsPermanent] = useState(true);

  const [formData, setFormData] = useState<PatientCaseFormData>({
    UnkID: Date.now(),
    PatientCode: Patientcode,
  })

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedPatient');
    if(stored) {
      const parsed = JSON.parse(stored);
      setPatientInfo(parsed);
      setFormData((prev) => ({
        ...prev,
        PatientFullName: parsed.PatientName || parsed.PATIENTNAME,
        Age: parsed.Age,
        Gender: parsed.Sex,
        ContactNumber: parsed.Mobile
      }));
    }
  }, []);

  useEffect(() => {
    fetch("/api/masters/patient-case")
    .then(res => res.json())
    .then(data => setMasterData(data))
    .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (sameAsPermanent){
      setTemporaryAddress(permanentAddress);
      setFormData((prev) => ({
        ...prev,
        TemporaryProvince: permanentAddress.province,
        TemporaryDistrict: permanentAddress.district,
        TemporaryMunicipality: permanentAddress.municipality,
        TemporaryWard: permanentAddress.ward,
        TemporaryTole: permanentAddress.tole
      }))
    }
  }, [permanentAddress, sameAsPermanent]);

  const getDistricts = (province: string): District[] => 
     nepalProvinces.find(p => p.value === province)?.districts ?? [];

  const getMunicipalities = (
    province: string,
    district: string
  ): Municipality[] => 
     getDistricts(province).find(d => d.value === district)?.municipalities || [];


    const calculateDisability = (
  eye: string | undefined,
  hand: string | undefined,
  foot: string | undefined,
  type: "Diagnosis" | "RFT"
) => {
  const values = [
    ...(eye?.split(",") || []),
    ...(hand?.split(",") || []),
    ...(foot?.split(",") || [])
  ].map((v) => Number(v) || 0);

  const ehf = values.reduce((sum, val) => sum + val, 0);
  const whoGrade = Math.max(...values);

  if(type === "Diagnosis") {
    setFormData((prev) => ({
      ...prev,
      EhfScoreDiagnosis: ehf.toString(),
      WhoGradingScoreDiagnosis: whoGrade.toString(),
    }))
  }else {
    setFormData((prev) => ({
      ...prev,
      EhfScoreRFT: ehf.toString(),
      WhoGradingScoreRFT: whoGrade.toString(),
    }))
  }
}

  const handleSave = async (payload?: any) => {
    try{
      const res = await fetch("/api/patient/patientcase", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
         },
      
        body: JSON.stringify(formData || payload),
      });
      const data = await res.json();
      console.log("Data",data);
      if(data.success) {
      alert("Patient Case saved successfully");
      setFormData({
        UnkID: Date.now(),
        PatientCode: Patientcode
      });

      setPermanentAddress(emptyAddress);
      setTemporaryAddress(emptyAddress);
      setSameAsPermanent(true);
      }  
      else alert("Failed: " + data.message);
    } catch (err) {
      console.log(err);
      alert("Error saving record");
    }
  };

  return (
    <div className="min-h-screen space-y-6">

            {/* PAGE HEADER */}
      <div className="bg-white rounded-xl border px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">
          Patient Clinical Record
        </h1>
        <p className="text-sm text-gray-500">
          Laboratory, Imaging & Clinical Information
        </p>
      </div>

      {/* ========================== PATIENT BASIC INFORMATION ========================== */}
      <Section title="Add Patient Basic Information">
        <Grid cols={3}>
          <Input
            label="Registration Date:"
            type="date"
            value={formData.RegistrationDate || ""}
            onChange={(e:any) => setFormData({ ...formData, RegistrationDate: e.target.value })}
          />
          <Input
            label="Patient FullName:"
            value={formData.PatientFullName || ""}
            onChange={(e:any) => setFormData({ ...formData, PatientFullName: e.target.value })}
          />
          <Input
            label="Gardian's FullName:"
            value={formData.PatientGardiansFullName || ""}
            onChange={(e:any) => setFormData({ ...formData, PatientGardiansFullName: e.target.value })}
          />

          <Select
            label="Is Pregnant:"
            value={formData.IsPregnent || ""}
            onChange={(e) => setFormData({ ...formData, IsPregnent: e.target.value })}
          >
            {masterData?.pregnancyStatus?.map((p: any) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
          <Input
            label="If Pregnant Time of Pregnant(in week):"
            value={formData.TimeOfPregnent || ""}
            onChange={(e:any) => setFormData({ ...formData, TimeOfPregnent: e.target.value })}
          />
          <Select
            label="Ethnic Code:"
            value={formData.EthnicCode || ""}
            onChange={(e) => setFormData({ ...formData, EthnicCode: e.target.value })}
          >
            {masterData?.ethnic?.map((e: any) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </Select>

          <Input
            label="Age:"
            value={formData.Age || ""}
            onChange={(e:any) => setFormData({ ...formData, Age: e.target.value })}
          />
          <Input
            label="Gender"
            value={formData.Gender || ""}
            onChange={(e:any) => setFormData({ ...formData, Gender: e.target.value })}
          />

          <Select
            label="Marital Status:"
            value={formData.MaritalStatus || ""}
            onChange={(e) => setFormData({ ...formData, MaritalStatus: e.target.value })}
          >
            {masterData?.maritalStatus?.map((m: any) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>

          <Input
            label="Past Occupation:"
            value={formData.PastOccupation || ""}
            onChange={(e:any) => setFormData({ ...formData, PastOccupation: e.target.value })}
          />
          <Input
            label="Present Occupation:"
            value={formData.PresentOccupation || ""}
            onChange={(e:any) => setFormData({ ...formData, PresentOccupation: e.target.value })}
          />
          <Input
            label="If Student What is The Highest Class Passed:"
            value={formData.StudentHighestClassPassed || ""}
            onChange={(e:any) => setFormData({ ...formData, StudentHighestClassPassed: e.target.value })}
          />

          <Input
            label="Contact Number:"
            value={formData.ContactNumber || ""}
            onChange={(e:any) => setFormData({ ...formData, ContactNumber: e.target.value })}
          />
          <Input
            label="Contact Person Name:"
            value={formData.ContactPersonName || ""}
            onChange={(e:any) => setFormData({ ...formData, ContactPersonName: e.target.value })}
          />
          <Select
            label="Is any Family Member with Leprosy:"
            value={formData.IsAnyMemberWithLeprosy || ""}
            onChange={(e) => setFormData({ ...formData, IsAnyMemberWithLeprosy: e.target.value })}
          />
          <Input
            label="SARI Admission Date:"
            type="date"
            value={formData.SARIAdmissionDate || ""}
            max={new Date().toISOString().split("T")[0]} // cannot select future date
            onChange={(e: any) =>
              setFormData({ ...formData, SARIAdmissionDate: e.target.value })
            }
          />

        </Grid>
      </Section>

      {/* ========================== PERMANENT ADDRESS ========================== */}
      <Section title="Permanent Address">
        <Grid cols={5}>
          <Select
            label="Province:"
            value={permanentAddress.province}
            onChange={(e) => {
              setPermanentAddress({ ...emptyAddress, province: e.target.value });
              setFormData((prev) => ({ ...prev, PermanentProvince: e.target.value }));
            }}
          >
            <option value="">Select Province</option>
            {nepalProvinces.map((p) => (
              <option key={p.value} value={p.value}>{p.name}</option>
            ))}
          </Select>

          <Select
            label="District:"
            value={permanentAddress.district}
            disabled={!permanentAddress.province}
            onChange={(e) => {
              setPermanentAddress((prev) => ({ ...prev, district: e.target.value, municipality: "" }));
              setFormData((prev) => ({ ...prev, PermanentDistrict: e.target.value }));
            }}
          >
            <option value="">Select District</option>
            {getDistricts(permanentAddress.province).map((d) => (
              <option key={d.value} value={d.value}>{d.name}</option>
            ))}
          </Select>

          <Select
            label="Municipality:"
            value={permanentAddress.municipality}
            disabled={!permanentAddress.district}
            onChange={(e) => {
              setPermanentAddress((prev) => ({ ...prev, municipality: e.target.value }));
              setFormData((prev) => ({ ...prev, PermanentMunicipality: e.target.value }));
            }}
          >
            <option value="">Select Municipality</option>
            {getMunicipalities(permanentAddress.province, permanentAddress.district).map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </Select>

          <Input
            label="Ward No:"
            value={permanentAddress.ward}
            onChange={(e:any) => {
              setPermanentAddress((prev) => ({ ...prev, ward: e.target.value }));
              setFormData((prev) => ({ ...prev, PermanentWard: e.target.value }));
            }}
          />

          <Input
            label="Tole:"
            value={permanentAddress.tole}
            onChange={(e:any) => {
              setPermanentAddress((prev) => ({ ...prev, tole: e.target.value }));
              setFormData((prev) => ({ ...prev, PermanentTole: e.target.value }));
            }}
          />
        </Grid>
      </Section>

      {/* ========================== TEMPORARY ADDRESS ========================== */}
      <Section title="Temporary Address">
        <Checkbox
          label="Same as Permanent Address"
          checked={sameAsPermanent}
          onChange={(e: any) => setSameAsPermanent(e.target.checked)}
        />

        <Grid cols={5}>
          {/* Province */}
          <Select
            label="Province:"
            value={sameAsPermanent ? permanentAddress.province : temporaryAddress.province}
            disabled={sameAsPermanent}
            onChange={(e) => {
              const province = e.target.value;
              setTemporaryAddress({ ...emptyAddress, province }); // reset other fields
              setFormData((prev) => ({ ...prev, TemporaryProvince: province }));
            }}
          >
            <option value="">Select Province</option>
            {nepalProvinces.map((p) => (
              <option key={p.value} value={p.value}>{p.name}</option>
            ))}
          </Select>

          {/* District */}
          <Select
            label="District:"
            value={sameAsPermanent ? permanentAddress.district : temporaryAddress.district}
            disabled={sameAsPermanent || !(sameAsPermanent ? permanentAddress.province : temporaryAddress.province)}
            onChange={(e) => {
              const district = e.target.value;
              setTemporaryAddress((prev) => ({ ...prev, district, municipality: "" }));
              setFormData((prev) => ({ ...prev, TemporaryDistrict: district }));
            }}
          >
            <option value="">Select District</option>
            {(sameAsPermanent
              ? getDistricts(permanentAddress.province)
              : getDistricts(temporaryAddress.province)
            ).map((d) => (
              <option key={d.value} value={d.value}>{d.name}</option>
            ))}
          </Select>

          {/* Municipality */}
          <Select
            label="Municipality:"
            value={sameAsPermanent ? permanentAddress.municipality : temporaryAddress.municipality}
            disabled={sameAsPermanent || !(sameAsPermanent ? permanentAddress.district : temporaryAddress.district)}
            onChange={(e) => {
              const municipality = e.target.value;
              setTemporaryAddress((prev) => ({ ...prev, municipality }));
              setFormData((prev) => ({ ...prev, TemporaryMunicipality: municipality }));
            }}
          >
            <option value="">Select Municipality</option>
            {(sameAsPermanent
              ? getMunicipalities(permanentAddress.province, permanentAddress.district)
              : getMunicipalities(temporaryAddress.province, temporaryAddress.district)
            ).map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </Select>

          {/* Ward */}
          <Input
            label="Ward No:"
            value={sameAsPermanent ? permanentAddress.ward : temporaryAddress.ward}
            disabled={sameAsPermanent}
            onChange={(e: any) => {
              const ward = e.target.value;
              setTemporaryAddress((prev) => ({ ...prev, ward }));
              setFormData((prev) => ({ ...prev, TemporaryWard: ward }));
            }}
          />

          {/* Tole */}
          <Input
            label="Tole:"
            value={sameAsPermanent ? permanentAddress.tole : temporaryAddress.tole}
            disabled={sameAsPermanent}
            onChange={(e: any) => {
              const tole = e.target.value;
              setTemporaryAddress((prev) => ({ ...prev, tole }));
              setFormData((prev) => ({ ...prev, TemporaryTole: tole }));
            }}
          />
        </Grid>
      </Section>


            {/* ========================== PATIENT CASE TYPE ========================== */}
      <Section title="Patient Case Type">
        <Grid cols={3}>
          <Select
            label="Type of Cases:"
            value={formData.TypeofCase || ""}
            onChange={(e) => setFormData({ ...formData, TypeofCase: e.target.value })}
          >
            {masterData?.caseType?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="RJ Clasification:"
            value={formData.JD_Classification || ""}
            onChange={(e) => setFormData({ ...formData, JD_Classification: e.target.value })}
          >
            {masterData?.rjClassification?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="Mode Of Detection:"
            value={formData.ModeOfDetection || ""}
            onChange={(e) => setFormData({ ...formData, ModeOfDetection: e.target.value })}
          >
            {masterData?.modeOfDetection?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="Leprosy Treatment Status:"
            value={formData.TypeOfPatientRegistration || ""}
            onChange={(e) => setFormData({ ...formData, TypeOfPatientRegistration: e.target.value })}
          >
            {masterData?.treatmentStatus?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="Today's Major Problem:"
            value={formData.TodaysMajorProblem || ""}
            onChange={(e) => setFormData({ ...formData, TodaysMajorProblem: e.target.value })}
          >
            {masterData?.todayMajorProblem?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="If New Case Reffered Counselling:"
            value={formData.IsRefferedCounsling || ""}
            onChange={(e) => setFormData({ ...formData, IsRefferedCounsling: e.target.value })}
          >
            {masterData?.newCaseReferredCounselling?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="Nerve Function Assesment:"
            value={formData.IsNerveFunctionAssesment || ""}
            onChange={(e) => setFormData({ ...formData, IsNerveFunctionAssesment: e.target.value })}
          >
            {masterData?.nerveFunctionAssessment?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="Provide Health Education:"
            value={formData.IsProvideHealthEducation || ""}
            onChange={(e) => setFormData({ ...formData, IsProvideHealthEducation: e.target.value })}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>

          <Select
            label="Type Of Lepra Reaction:"
            value={formData.TypeOfLepraReaction || ""}
            onChange={(e) => setFormData({ ...formData, TypeOfLepraReaction: e.target.value })}
          >
            {masterData?.lepraReaction?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Input
            label="Date Reaction Symptoms noticed:"
            type="date"
            value={formData.DateOfReaction || ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e:any) => setFormData({ ...formData, DateOfReaction: e.target.value })}
          />

          <Input
            label="Date Of Starting Treatment:"
            type="date"
            value={formData.DateOfSTreatmentForReaction || ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e:any) => setFormData({ ...formData, DateOfSTreatmentForReaction: e.target.value })}
          />

          <Select
            label="Neuritis:"
            value={formData.IsNeuritis || ""}
            onChange={(e) => setFormData({ ...formData, IsNeuritis: e.target.value })}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>

          <Input
            label="Date Neuritis:"
            type="date"
            value={formData.DateOfNeuritis || ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e:any) => setFormData({ ...formData, DateOfNeuritis: e.target.value })}
          />

          <Input
            label="Date Of Starting Treatment:"
            type="date"
            value={formData.DateOfStartingTreatmentForNeuritis || ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e:any) => setFormData({ ...formData, DateOfStartingTreatmentForNeuritis: e.target.value })}
          />

          <Select
            label="Ulcer:"
            value={formData.Ulcer || ""}
            onChange={(e) => setFormData({ ...formData, Ulcer: e.target.value })}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </Select>

          <Select
            label="Drug Reaction:"
            value={formData.DrugReaction || ""}
            onChange={(e) => setFormData({ ...formData, DrugReaction: e.target.value })}
          >
            {masterData?.drugReaction?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Input
            label="MDT Completion Date:"
            type="date"
            value={formData.MDTCompletionDate || ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e:any) => setFormData({ ...formData, MDTCompletionDate: e.target.value })}
          />
        </Grid>
      </Section>

      {/* ========================== BIOPSY INFORMATION ========================== */}
      <Section title="Biopsy Information">
        <Grid cols={3}>
          <Select
            label="Biopsy:"
            value={formData.Biopsy || ""}
            onChange={(e) => setFormData({ ...formData, Biopsy: e.target.value })}
          >
            {masterData?.biopsy?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Select
            label="Biopsy Result:"
            value={formData.BiopsyResult || ""}
            onChange={(e) => setFormData({ ...formData, BiopsyResult: e.target.value })}
          >
            {masterData?.biopsyResult?.map((c: any) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Input
            label="Skin Smear Date:"
            type="date"
            value={formData.SkinSmearDate || ""}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e:any) => setFormData({ ...formData, SkinSmearDate: e.target.value })}
          />

          <Select
            label="R Ear lobe:"
            value={formData.SkinSmearREarLobe || ""}
            onChange={(e) => setFormData({ ...formData, SkinSmearREarLobe: e.target.value })}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>

          <Select
            label="L Ear lobe:"
            value={formData.SkinSmearLEarLobe || ""}
            onChange={(e) => setFormData({ ...formData, SkinSmearLEarLobe: e.target.value })}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>

          <Select
            label="Lesion 1 or R arm:"
            value={formData.SkinSmearRArm || ""}
            onChange={(e) => setFormData({ ...formData, SkinSmearRArm: e.target.value })}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>

          <Select
            label="Lesion 1 or L Thigh:"
            value={formData.SkinSmearLThigh || ""}
            onChange={(e) => setFormData({ ...formData, SkinSmearLThigh: e.target.value })}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </Grid>
      </Section>


          {/* ========================== DISABILITY STATUS ========================== */}
          <Section title="Disability Status">
            <div className="space-y-6">
              {/* WHO Disability Grading during Diagnosis */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">WHO Disability Grading during Diagnosis:</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <DisabilityBlock title="Eye Diagnosis:">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Right:"
                        small
                        value={formData.EyeDiagnosis?.split(",")[0] || ""}
                        onChange={(e:any) => {
                          const left = formData.EyeDiagnosis?.split(",")[1] || "";
                          setFormData({ ...formData, EyeDiagnosis: `${e.target.value},${left}` });
                        }}
                      />
                      <Input
                        label="Left:"
                        small
                        value={formData.EyeDiagnosis?.split(",")[1] || ""}
                        onChange={(e:any) => {
                          const right = formData.EyeDiagnosis?.split(",")[0] || "";
                          setFormData({ ...formData, EyeDiagnosis: `${right},${e.target.value}` });
                        }}
                      />
                    </div>
                  </DisabilityBlock>

                  <DisabilityBlock title="Hand Diagnosis:">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Right:"
                        small
                        value={formData.HandDiagnosis?.split(",")[0] || ""}
                        onChange={(e:any) => {
                          const left = formData.HandDiagnosis?.split(",")[1] || "";
                          setFormData({ ...formData, HandDiagnosis: `${e.target.value},${left}` });
                        }}
                      />
                      <Input
                        label="Left:"
                        small
                        value={formData.HandDiagnosis?.split(",")[1] || ""}
                        onChange={(e:any) => {
                          const right = formData.HandDiagnosis?.split(",")[0] || "";
                          setFormData({ ...formData, HandDiagnosis: `${right},${e.target.value}` });
                        }}
                      />
                    </div>
                  </DisabilityBlock>

                  <DisabilityBlock title="Foot Diagnosis:">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Right:"
                        small
                        value={formData.FootDiagnosis?.split(",")[0] || ""}
                        onChange={(e:any) => {
                          const left = formData.FootDiagnosis?.split(",")[1] || "";
                          setFormData({ ...formData, FootDiagnosis: `${e.target.value},${left}` });
                        }}
                      />
                      <Input
                        label="Left:"
                        small
                        value={formData.FootDiagnosis?.split(",")[1] || ""}
                        onChange={(e:any) => {
                          const right = formData.FootDiagnosis?.split(",")[0] || "";
                          setFormData({ ...formData, FootDiagnosis: `${right},${e.target.value}` });
                        }}
                      />
                    </div>
                  </DisabilityBlock>
                </div>

                <div className="mt-3">
                  <Input
                    label="EHF Score (Diagnosis):"
                    value={formData.EhfScoreDiagnosis || ""}
                    disabled
                    onChange={(e:any) => setFormData({ ...formData, EhfScoreDiagnosis: e.target.value })}
                  />
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <div className="mt-3 flex-1">
                    <Input
                      label="WHO Grading (Diagnosis):"
                      fullWidth
                      value={formData.WhoGradingScoreDiagnosis || ""}
                      disabled
                      onChange={(e:any) => setFormData({ ...formData, WhoGradingScoreDiagnosis: e.target.value })}
                    />
                  </div>
                  <button 
                  type="button"
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 h-10"
                  onClick={() => calculateDisability(formData.EyeDiagnosis, formData.HandDiagnosis, formData.FootDiagnosis, "Diagnosis")}
                  >
                    Calculate
                  </button>
                </div>
              </div>

              {/* WHO Disability Grading during RFT */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-700">WHO Disability Grading during RFT:</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <DisabilityBlock title="Eye RFT:">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Right:"
                        small
                        value={formData.EyeRFT?.split(",")[0] || ""}
                        onChange={(e:any) => {
                          const left = formData.EyeRFT?.split(",")[1] || "";
                          setFormData({ ...formData, EyeRFT: `${e.target.value},${left}` });
                        }}
                      />
                      <Input
                        label="Left:"
                        small
                        value={formData.EyeRFT?.split(",")[1] || ""}
                        onChange={(e:any) => {
                          const right = formData.EyeRFT?.split(",")[0] || "";
                          setFormData({ ...formData, EyeRFT: `${right},${e.target.value}` });
                        }}
                      />
                    </div>
                  </DisabilityBlock>

                  <DisabilityBlock title="Hand RFT:">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Right:"
                        small
                        value={formData.HandRFT?.split(",")[0] || ""}
                        onChange={(e:any) => {
                          const left = formData.HandRFT?.split(",")[1] || "";
                          setFormData({ ...formData, HandRFT: `${e.target.value},${left}` });
                        }}
                      />
                      <Input
                        label="Left:"
                        small
                        value={formData.HandRFT?.split(",")[1] || ""}
                        onChange={(e:any) => {
                          const right = formData.HandRFT?.split(",")[0] || "";
                          setFormData({ ...formData, HandRFT: `${right},${e.target.value}` });
                        }}
                      />
                    </div>
                  </DisabilityBlock>

                  <DisabilityBlock title="Foot RFT:">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Right:"
                        small
                        value={formData.FootRFT?.split(",")[0] || ""}
                        onChange={(e:any) => {
                          const left = formData.FootRFT?.split(",")[1] || "";
                          setFormData({ ...formData, FootRFT: `${e.target.value},${left}` });
                        }}
                      />
                      <Input
                        label="Left:"
                        small
                        value={formData.FootRFT?.split(",")[1] || ""}
                        onChange={(e:any) => {
                          const right = formData.FootRFT?.split(",")[0] || "";
                          setFormData({ ...formData, FootRFT: `${right},${e.target.value}` });
                        }}
                      />
                    </div>
                  </DisabilityBlock>
                </div>

                <div className="mt-3">
                  <Input
                    label="EHF Score (RFT):"
                    value={formData.EhfScoreRFT || ""}
                    disabled
                    onChange={(e:any) => setFormData({ ...formData, EhfScoreRFT: e.target.value })}
                  />
                </div>

                <div className="mt-3 flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      label="WHO Grading (RFT):"
                      value={formData.WhoGradingScoreRFT || ""}
                      disabled
                      onChange={(e:any) => setFormData({ ...formData, WhoGradingScoreRFT: e.target.value })}
                    />
                  </div>
                  <button 
                  type="button"
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 h-10"
                  onClick={() => calculateDisability(formData.EyeRFT, formData.HandRFT, formData.FootRFT, "RFT")}
                  >
                    Calculate
                  </button>
                </div>
              </div>
            </div>
          </Section>

      {/* ========================== CONTACT TRACING ========================== */}
      <Section title="Contact Tracing & Patient Deducted Information">
        <div className="space-y-4">
          <div className="w-64">
            <Input
              label="Number Of Person:"
              value={formData.NoOfDiagnosis || ""}
              onChange={(e:any) => setFormData({ ...formData, NoOfDiagnosis: e.target.value })}
            />
          </div>

          <Input
            label="Contact Number Of Person:"
            value={formData.ContactNoOfPerson || ""}
            onChange={(e:any) => setFormData({ ...formData, ContactNoOfPerson: e.target.value })}
          />

          <Input
            label="Name Of Contact Examined:"
            value={formData.NameOfContactExam || ""}
            onChange={(e:any) => setFormData({ ...formData, NameOfContactExam: e.target.value })}
          />

          <Input
            label="Age/Sex Of Contact Person:"
            value={formData.AgeOrSexOfContactPerson || ""}
            onChange={(e:any) => setFormData({ ...formData, AgeOrSexOfContactPerson: e.target.value })}
          />

          <Input
            label="Leprosy Diagnosis:"
            value={formData.LeprosyDiagnosis || ""}
            onChange={(e:any) => setFormData({ ...formData, LeprosyDiagnosis: e.target.value })}
          />

          <Input
            label="Contact Examination Date:"
            type="date"
            value={formData.ContactExaminationDate || ""}
            onChange={(e:any) => setFormData({ ...formData, ContactExaminationDate: e.target.value })}
          />

          <Input
            label="Way Of Deduction:"
            value={formData.WayOfDeduction || ""}
            onChange={(e:any) => setFormData({ ...formData, WayOfDeduction: e.target.value })}
          />

          <Input
            label="Deducted Date:"
            type="date"
            value={formData.DeductedDate || ""}
            onChange={(e:any) => setFormData({ ...formData, DeductedDate: e.target.value })}
          />

          <Input
            label="CRS Place:"
            value={formData.CRSPlace || ""}
            onChange={(e:any) => setFormData({ ...formData, CRSPlace: e.target.value })}
          />

          <Textarea
            label="Remarks:"
            value={formData.Remarks || ""}
            onChange={(e: any) => setFormData({ ...formData, Remarks: e.target.value })}
          />
        </div>
      </Section>


      {/* CONTACT TRACING */}
      {/* <Section title="Contact Tracing & Patient Deducted Information">
        <div className="space-y-4">
          <div className="w-64">
            <Input label="Number Of Person:" />
          </div>
          <div>
            <Textarea label="Remarks:" />
          </div>
        </div>
      </Section> */}

      {/* ACTIONS */}
      {/* ========================== ACTIONS ========================== */}
      <div className="flex justify-end gap-3 pb-6">
        <button
          className="px-8 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          onClick={() => {
              // Make sure permanent and temporary addresses are included in formData
              const payload = {
                ...formData,
                 // Convert comma-separated strings into arrays
                EyeDiagnosis: formData.EyeDiagnosis?.split(",") || [],
                HandDiagnosis: formData.HandDiagnosis?.split(",") || [],
                FootDiagnosis: formData.FootDiagnosis?.split(",") || [],
                EyeRFT: formData.EyeRFT?.split(",") || [],
                HandRFT: formData.HandRFT?.split(",") || [],
                FootRFT: formData.FootRFT?.split(",") || [],

                // Ensure boolean-like fields are actual booleans
                IsNerveFunctionAssesment: Boolean(Number(formData.IsNerveFunctionAssesment)),
                IsPregnent: Boolean(Number(formData.IsPregnent)),
                IsRefferedCounsling: Boolean(Number(formData.IsRefferedCounsling)),

                // Validate date fields (return null if invalid)
                ContactExaminationDate: isValidDate(formData.ContactExaminationDate) ? formData.ContactExaminationDate : null,
                DateOfNeuritis: isValidDate(formData.DateOfNeuritis) ? formData.DateOfNeuritis : null,
                DateOfReaction: isValidDate(formData.DateOfReaction) ? formData.DateOfReaction : null,
                DateOfSTreatmentForReaction: isValidDate(formData.DateOfSTreatmentForReaction) ? formData.DateOfSTreatmentForReaction : null,
                DateOfStartingTreatmentForNeuritis: isValidDate(formData.DateOfStartingTreatmentForNeuritis) ? formData.DateOfStartingTreatmentForNeuritis : null,
                MDTCompletionDate: isValidDate(formData.MDTCompletionDate) ? formData.MDTCompletionDate : null,
                SARIAdmissionDate: isValidDate(formData.SARIAdmissionDate) ? formData.SARIAdmissionDate : null,
                SkinSmearDate: isValidDate(formData.SkinSmearDate) ? formData.SkinSmearDate : null,
                PermenantAddress: permanentAddress,
                TemporaryAddress: temporaryAddress,
                PermanentProvince: permanentAddress.province,
                PermanentDistrict: permanentAddress.district,
                PermanentMunicipality: permanentAddress.municipality,
                PermanentWard: permanentAddress.ward,
                PermanentTole: permanentAddress.tole,
                TemporaryProvince: temporaryAddress.province,
                TemporaryDistrict: temporaryAddress.district,
                TemporaryMunicipality: temporaryAddress.municipality,
                TemporaryWard: temporaryAddress.ward,
                TemporaryTole: temporaryAddress.tole,
              };
              console.log("Sending Form Data",payload);
              handleSave(payload);
          }}
        >
          Save
        </button>
      </div>

    </div>
  );
}
export default PatientClinicalRecordPage





function isValidDate(dateStr:any) {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/* ===================== */
/* REUSABLE UI ELEMENTS  */
/* ===================== */

function Section({ title, children, defaultOpen=false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white border rounded-lg shadow-sm">

      <div className="px-5 py-3 border-b bg-white flex justify-between items-center" 
      onClick={() => setOpen(!open)}
      >
        <h2 className="font-semibold text-green-600 text-base">{title}</h2>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>
      {open && (
        <div className="p-6">{children}</div>
      )}
    </div>
  );
}

function Grid({ cols, children}: any) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {children}
    </div>
  );
}

function Input({
  label,
  placeholder,
  defaultValue,
  value,
  onChange,
  small,
  fullWidth,
  type = "text",
  max,
  min,
  disabled = false,
}: any) {
  return (
    <div className={`flex flex-col ${fullWidth ? "col-span-full" : ""}`}>
      <label className="text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        max={max}
        min={min}
        disabled={disabled}
        className={`border border-gray-300 rounded px-3 ${
          small ? "py-1.5" : "py-2"
        } focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm bg-white disabled:bg-gray-100`}
      />
    </div>
  );
}


function Select({
  label,
  value,
  onChange,
  disabled = false,
  defaultText = "Select an option",
  children,
}: {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  defaultText?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm bg-white disabled:bg-gray-100"
      >
        {/* Default option always present */}
        <option value=""></option>

        {/* Render children only if provided */}
        {children}
      </select>
    </div>
  );
}


function Textarea({ label }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        rows={4}
        className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm resize-none"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: any) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}


function DisabilityBlock({ title, children }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h4 className="font-medium mb-3 text-gray-700 text-sm">{title}</h4>
      {children}
    </div>
  );
}