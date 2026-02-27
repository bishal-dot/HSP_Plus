"use client";

import ConsultantNotes from "@/app/(admin)/consultant-notes/[patientCode]/components/ConsultantNotes";
import { useParams, useRouter } from "next/navigation";

export default function ConsultantNotesPage() {
  const { patientCode } = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen px-6 mb-10">
      <div className="flex flex-row-reverse justify-between">
        <button
          onClick={() => router.back()}
          className="mb-4 text-xl text-blue-600 hover:cursor-pointer hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-semibold mb-2">Consultant Notes</h1>
      </div>
      
      {/* Your consultant notes content goes here */}
      {/* {patientCode ? (
        <PreviousConsultantNotes patientCode={patientCode} />
      ) : (
      <p>No Patient Code provided</p>
      )
    } */}
     <ConsultantNotes />
    </div>
  );
}
