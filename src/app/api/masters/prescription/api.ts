export const fetchPrescriptionMaster = async (token: string) => {
    const res = await fetch(`/api/masters/prescription`,{
        method: "GET",
        headers:{
            Authorization: `Bearer ${token}`
        },
        cache: 'no-cache'
    });

    if(!res.ok) throw new Error("Failed to fetch Prescription Master");
    return res.json();
};

