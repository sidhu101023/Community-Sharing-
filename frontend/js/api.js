const API_URL = "/api";


async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };


    if (token) {

        headers.Authorization = `Bearer ${token}`;

    }


    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


        // Try to read JSON response
        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Something went wrong"
            );

        }


        return data;

    } catch (error) {

        console.error("API Error:", error);

        throw error;

    }

}