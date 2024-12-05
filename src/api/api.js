const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
};

/**
 * @typedef {Object} ContactResponse
 * @property {boolean} success - Whether the contact request was successful
 * @property {string} message - Response message from server
 */

/**
 * @typedef {Object} ContactFormData
 * @property {string} name - name of contactee
 * @property {string} email - email address of contacteee
 * @property {string | null} subject - optional subject of contact message
 * @property {string} message - contact message contents
 */

const api = {
    /**
     * Contacts the user
     * @param {ContactFormData} formData - the form data
     * @returns {Promise<ContactResponse>} - the contact response from server
     */
    contactUs: async (formData) => {
        // console.log('Sending to:', `${API_URL}/contact`);
        // console.log('Data:', formData);
        return await apiRequest("/contact", {
            method: "POST",
            body: JSON.stringify(formData),
        });
    },
    /**
     * Uploads the form data to the server.
     *
     * @param {FormData} formData - The form data to be uploaded.
     * @example
     * const formData = new FormData();
     * formData.append('files', file1);
     * formData.append('files', file2);
     * formData.append('options', JSON.stringify({
     *   runtimeInMinutes,
     *   s3Weight,
     *   ecWeight
     * }));
     *
     * upload(formData);
     *
     * @returns {Promise} - A promise that resolves with the server response.
     */
    upload: async (formData) => {
        return await apiRequest("/jobs/preprocess", {
            method: "POST",
            body: formData 
        });
    },
};

export default api;
