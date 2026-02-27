import { useAuthToken } from "@/context/AuthContext";
import { useDischargeSummary } from "../queries/dischargeSummary.queries";
import { CircleOff } from "lucide-react";

const IPDDischargeSummary = () => {

    const { authToken } = useAuthToken();
    const MrNO: string = '0126104';
    const { data:dischargeSummary} = useDischargeSummary(authToken, MrNO); 

    console.log("Operation Records", dischargeSummary);
    return(
        <div>
            <div className="flex flex-col items-center justify-center gap-5 mt-10">
                <CircleOff size={64} className="text-slate-800" />
                <span className="text-2xl font-semibold text-slate-800">No Discharge Summary</span>
            </div>
        </div>
    );
};

export default IPDDischargeSummary;