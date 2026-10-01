// Live Server uses port 5500, while the Express API runs on port 5000.
// When the frontend is served by Express, a relative URL remains correct.
const API_URL = window.location.port === "5500" || window.location.protocol === "file:"
    ? `http://${window.location.hostname || "localhost"}:5000/api`
    : "/api";


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


        const responseText = await response.text();
        let data = {};

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(`The server returned an invalid response (${response.status}).`);
            }
        }


        if (!response.ok) {

            throw new Error(
                data.message || `Request failed with status ${response.status}`
            );

        }


        return data;

    } catch (error) {

        console.error("API Error:", error);

        throw error;

    }

}
