import { useAuthToken } from "@/context/AuthContext";
import { useOperationRecord } from "../queries/operaationrecord.queries";
import { CircleOff, FileX } from "lucide-react";

interface props {
    PatientCode: string;
}

const IPDOperationRecords: React.FC<props> = ({PatientCode}) => {

    const { authToken } = useAuthToken();
    const { data: operationRecords, error, isLoading} = useOperationRecord(authToken, PatientCode);

    console.log("Jaja",PatientCode)

    console.log("Operation Records", operationRecords, error, isLoading);
    return(
        <div>
            <div className="flex flex-col items-center justify-center gap-5 mt-10">
                <CircleOff size={64} className="text-slate-800" />
                <span className="text-2xl font-semibold text-slate-800">No Operation Records</span>
            </div>
        </div>
    );
};

export default IPDOperationRecords;