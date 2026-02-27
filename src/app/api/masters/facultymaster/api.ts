export const fetchFacultyMaster = async (token: string) => {
    const res = await fetch(`/api/masters/facultymaster`,{
        method: "GET",
        headers:{
            Authorization: `Bearer ${token}`
        },
        cache: 'no-cache'
    });

    if(!res.ok) throw new Error("Failed to fetch Faculty Master");
    return res.json();
}; 