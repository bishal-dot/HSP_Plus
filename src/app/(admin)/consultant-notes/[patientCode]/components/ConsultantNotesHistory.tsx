"use client";
import { useAuthToken } from "@/context/AuthContext";
import { useConsultantNotes } from "@/app/(admin)/consultant-notes/[patientCode]/queries/consultant-notes.queries";
import { consultantNotesResponse} from "@/types/consultant-notes.type";
import {
  FileText,
  Stethoscope,
  Activity,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertCircle,
  Edit,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PreviousConsultantNotesProps {
  patientCode: string;
  onCreateNew?: () => void;
}

const PreviousConsultantNotes: React.FC<PreviousConsultantNotesProps> = ({patientCode, onCreateNew}) => {
  if (!patientCode) {
    console.log("No patient code provided");
    return <p>Loading patient info...</p>;
  }

  const { authToken } = useAuthToken();

  const query = useConsultantNotes(authToken, patientCode);
  const { data, isFetching, isError, error } = query;

  const [patientInfo, setPatientCode] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    if (!patientCode) {
      const stored = sessionStorage.getItem('selectedPatient');
      if (stored) {
        const patient = JSON.parse(stored);
        if (patient.PatientCode) setPatientCode(patient.PatientCode);
      }
    }
  }, [patientCode]);

  useEffect(() => {
    if(data){
      console.log("Consultant data arrived", data); 
    }
  }, [data]);
  
  const notes:consultantNotesResponse[] = Array.isArray(data) ? data : [];


  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleNote = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <>
     {isFetching && (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Loading...</h3>
          <p className="text-slate-500">Please wait while we fetch the data</p>
        </div>
      )}
    <div className="space-y-4">
      <div className="mb-6 flex justify-between items-center">
        <div >
            <h2
              className="text-2xl text-slate-900"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Previous Consultation Notes 
            </h2>
            <p className="text-sm text-slate-500">
              {notes.length} consultation{notes.length !== 1 && "s"} on record
            </p>
        </div>
        <div className="rounded-lg shadow-sm border border-gray-200 p-4 hover:cursor-pointer ease-in-out duration-300 hover:-translate-y-1">
          <h2 className="text-lg flex items-center gap-2"
            onClick={() => onCreateNew?.()}
          >
            <Edit className="w-5 h-5 text-blue-600" />
            "Create Consultant Notes"
          </h2>
        </div>
      </div>

      {notes?.length === 0 ?  (
        <div className=" rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No Previous Notes
          </h3>
          <p className="text-slate-500">
            There are no previous consultation notes for this patient
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const isExpanded = expandedId === note.UnkID;

            return (
              <div
                key={note.UnkID}
                className=" rounded-xl border border-slate-200 shadow-sm"
              >
                {/* HEADER */}
                <div
                  onClick={() => toggleNote(note.UnkID)}
                  className="p-5 cursor-pointer flex justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          note.visittype === "OPD"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {note.visittype}
                      </span>
                      <span className="text-sm">
                        {note.RegCode}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold">
                      {note.Diagnosis?.split("\n")[0] ||
                        "General Consultation"}
                    </h3>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-sm">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        {note.BlockedBy}
                      </div>

                      {note.FacultyName && (
                        <>
                          <span className="">•</span>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            {note.FacultyName}
                          </div>
                        </>
                      )}

                      {note.CENTERNAME && (
                        <>
                          <span className="">•</span>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            {note.CENTERNAME}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* BODY */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-5 border-t border-slate-100">
                    <NoteField label="Diagnosis" value={note.Diagnosis} highlight />
                    <NoteField label="Present Complaints" value={note.PresentComplaints} />
                    <NoteField label="Previous History" value={note.PreviousHistory} />
                    <NoteField label="Allergies" value={note.Allergies} alert />
                    <NoteField label="Treatment Plan" value={note.TreatmentPlan} />
                    <NoteField label="Recommendation" value={note.Recommendation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};

function NoteField({
  label,
  value,
  highlight,
  alert,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-600 uppercase flex gap-2">
        {alert && <AlertCircle className="w-4 h-4 text-amber-600" />}
        {label}
      </label>
      <div
        className={`p-3 rounded-lg border text-sm whitespace-pre-wrap ${
          highlight
            ? "bg-blue-50 border-blue-200 text-blue-900"
            : alert
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-slate-50 border-slate-200 text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default PreviousConsultantNotes;
