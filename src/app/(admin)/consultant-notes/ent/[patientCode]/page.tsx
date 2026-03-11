"use client";
import { useParams, useRouter } from "next/navigation";
import ENTConsultantNotes from "../../[patientCode]/components/ENTNewConsultantNotes";

export default function ConsultantNotesPage() {
  const { patientCode } = useParams();
  const router = useRouter();

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

      <ENTConsultantNotes />
    </div>
  );
}
