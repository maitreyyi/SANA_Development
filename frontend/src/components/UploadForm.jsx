import { useState } from "react";
import api from "../api/api";

function UploadForm() {
    const [optionsInputs, setOptionsInputs] = useState({});
    const [networkFiles, setNetworkFiles] = useState([]);

    const handleOptionsChange = (e) => {
        setOptionsInputs({
            ...optionsInputs,
            [e.target.name]: e.target.value,
        });
    };

    const handleFilesChange = (e) => {
        setNetworkFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (networkFiles.length < 2) {
            alert("Please select two files.");
            return;
        }

        const formData = new FormData();
        formData.append("options_inputs", JSON.stringify(optionsInputs));
        formData.append("network-files", networkFiles[0]);
        formData.append("network-files", networkFiles[1]);

        try {
            const response = await api.upload(formData);
            // Handle success or error based on response
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Render input fields for options */}
            <input
                type="number"
                name="t"
                onChange={handleOptionsChange}
                placeholder="Running time (1-20)"
            />
            {/* ...other options inputs */}
            <input
                type="file"
                name="network-files"
                onChange={handleFilesChange}
                multiple
                accept=".gw,.el"
            />
            <button type="submit">Submit</button>
        </form>
    );
}

export default UploadForm;
