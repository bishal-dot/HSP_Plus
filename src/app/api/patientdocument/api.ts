export const fetchPatientMaster = async (token: string | null) => {
    const res = await fetch(`/api/patientdocument`,{
        method: "GET",
        cache: 'no-cache'
    });
    if(!res.ok) throw new Error("Failed to fetch Patient Master");
    const data = await res.json();
    return data;
};