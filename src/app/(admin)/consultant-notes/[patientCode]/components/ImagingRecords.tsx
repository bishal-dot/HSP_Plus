"use client";

import { fetchImagingRecords } from "@/app/api/patient/imaging/api";
import { useAuthToken } from "@/context/AuthContext";
import { Image, FileText, Calendar } from "lucide-react";
import React, { useEffect } from "react";
import { useImagingRecords } from "../queries/imaging-records.queries";

interface props{
  Patientcode: string
}
const ImagingRecords:React.FC<props> = ({Patientcode}) => {

  const { authToken } = useAuthToken();

  const { data: imagingRecords, isFetching, isError } = useImagingRecords(authToken, Patientcode);
  
  console.log("imagingRecords", imagingRecords);
  
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Imaging Records</h2>
        <input
          type="text"
          placeholder="Search by scan type, tag or date..."
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64"
        />
      </div>

      {/* Grid of Imaging Records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {imagingRecords?.map((record) => (
          <div
            key={record.UnkId}
            className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">{record.DocumentTitle}</h3>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={14} /> {record.TranDate}
              </span>
            </div>

            {/* Tag */}
            <div className="mb-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {record.DocumentTag}
              </span>
            </div>

            {/* Image / Placeholder */}
            {/* Image / Placeholder */}
            <div className="bg-gray-100 h-40 flex items-center justify-center rounded-md mb-3 overflow-hidden">
              {record.URL ? (
                <img
                  src={record.URL}
                  alt={record.DocumentTitle}
                  className="object-contain h-full w-full"
                />
              ) : (
                <Image size={48} className="text-gray-400" />
              )}
            </div>


            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {record.ImgDescription || "No description available."}
            </p>
          </div>
        ))}

        {imagingRecords && imagingRecords.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No imaging records found.
          </p>
        )}
      </div>
    </div>
  );
}

export default ImagingRecords
