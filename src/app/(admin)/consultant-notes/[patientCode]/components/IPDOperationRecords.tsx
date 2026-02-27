import { useAuthToken } from "@/context/AuthContext";
import { useOperationRecord } from "../queries/operaationrecord.queries";
import { CircleOff, FileX } from "lucide-react";

const IPDOperationRecords = () => {

    const { authToken } = useAuthToken();
    const MrNO: string = '0126104';
    const { data:operationRecords} = useOperationRecord(authToken, MrNO);

    console.log("Operation Records", operationRecords);
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