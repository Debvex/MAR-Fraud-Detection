export const fetchSummary = async () => {
    try{
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/summary`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching summary:", error);
        throw error;

    }
} 

export const fetchActivityFeed = async () => {
    try{
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/submissions`, {  
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching activity feed:", error);
        throw error;
    }
}