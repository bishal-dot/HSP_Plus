import { useAuthToken } from "@/context/AuthContext";
import { useOperationRecord } from "../queries/operaationrecord.queries";

const IPDOperationRecords = () => {

    const { authToken } = useAuthToken();
    const MrNO: string = '0126104';
    const { data:operationRecords} = useOperationRecord(authToken, MrNO);

    console.log("Operation Records", operationRecords);
    return(
        <div>
            <h1>IPD Operation Records</h1>
        </div>
    );
};

export default IPDOperationRecords;