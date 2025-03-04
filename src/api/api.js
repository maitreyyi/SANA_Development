const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000';
console.log(API_URL);
/**
 * @typedef {import('../../backend/middlewares/ErrorHandler').ErrorHandler} ErrorHandler
 */
const apiRequest = async (endpoint, options = {}, hasMultipart = false) => {
    console.log('endpoint:', `${API_URL}/api${endpoint}`);//TESTING
    const headers = {
        ...options.headers,
    };
    if (!hasMultipart) {
        headers["Content-Type"] = "application/json";
    }
    try {
        const response = await fetch(`${API_URL}/api${endpoint}`, {
            headers,
            ...options,
        });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return await response.json();
            // throw new Error(`HTTP error! status: ${response.status}`);
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
     * @example for sana1.0
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
        return await apiRequest(
            "/jobs/preprocess",
            {
                method: "POST",
                body: formData,
            },
            true
        );
    },
    process: async (jobId) => {
        return await apiRequest("/jobs/process", {
            method: "POST",
            body: JSON.stringify({ id: jobId }),
        });
    },
    // getJobStatus: async (jobId) => {
    //     return await apiRequest(`/jobs/${jobId}`);
    // },
    /**
     * @typedef {import('../../backend/controllers/jobController').ErrorMessageResponse} ErrorMessageResponse
     * @typedef {import('../../backend/controllers/jobController').ProcessedJobResponse} ProcessedJobResponse
     * @typedef {import('../../backend/controllers/jobController').FailedJobResponse} FailedJobResponse
     */
    /**
     * @param {string} jobId
     * @returns {Promise<ProcessedJobResponse | ErrorMessageResponse | FailedJobResponse | ErrorResponse>}
     */
    getJobResult: async (jobId) => {
        return await apiRequest(`/jobs/${jobId}`);
    },
    downloadJobZip: async (jobId) => {
        const response = await fetch(`${API_URL}/api/jobs/${jobId}/zip`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.blob();
    },
};

export default api;
