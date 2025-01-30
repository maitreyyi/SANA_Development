import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

/* For future coder!
    Make sure to ask and explicitly write the ranges for all the options. 
    Also make sure to ensure the api requests and responses are correct.
    Currently in the process of switching to laravel so I did not handle that part yet.
*/

const JobSubmissionContext = createContext();

const SanaVersions = {
    SANA1: "SANA1",
    SANA1_1: "SANA1_1",
    SANA2: "SANA2",
};

const defaultOptions = {
    [SanaVersions.SANA1]: {
        runtimeInMinutes: 5,
        s3Weight: 1,
        ecWeight: 0,
    },
    [SanaVersions.SANA1_1]: {
        runtimeInMinutes: 5,
        s3Weight: 1,
        ecWeight: 0,
    },
    [SanaVersions.SANA2]: {
        s3Weight: 1,
        ecWeight: 0,
        weightOfIcs: 0,
        targetTolerance: 0.1,
    },
};

const optionFields = {
    runtimeInMinutes: {
        label: "Runtime in minutes",
        title: "The number of minutes to run SANA. Must be an integer between 1 and 20, inclusive.",
    },
    s3Weight: {
        label: "S3 weight",
        title: "The weight of the Symmetric Substructer Score in the objective function.",
    },
    ecWeight: {
        label: "EC weight",
        title: "The weight of the Edge Coverage in the objective function.",
    },
    weightOfIcs: {
        label: "Weight of ICS",
        title: "The weight of Induced Conservation Score in the objective function.",
    },
    targetTolerance: {
        label: "Target tolerance for optimal objective",
        title: "Target tolerance for optimal objective",
    },
};
const validExts = ["gw", "el"];

export function JobSubmissionProvider({ children }) {
    const navigate = useNavigate();
    const [options, setOptions] = useState(defaultOptions[SanaVersions.SANA1]);
    const [sanaVersion, setSanaVersion] = useState(SanaVersions.SANA1);
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [similarityData, setSimilarityData] = useState({
        optionalFilesCount: 0,
        similarityFiles: [],
        similarityWeights: [0, 0, 0],
    });

    const handleOptionChange = useCallback((optionValues) => {
        setOptions((prevData) => ({
            ...prevData,
            ...optionValues,
        }));
    }, []);

    const handleOptionalFilesCountChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0 && value <= 3) {
            setSimilarityData((prevData) => {
                return { ...prevData, optionalFilesCount: value };
            });
        }
    };

    const handleSimilarityFileChange = (event, index) => {
        const file = event.target.files[0];
        if (file && validateFile(file, `similarity-file${index + 1}`, true)) {
            setSimilarityData((prevData) => {
                const newFiles = [...prevData.similarityFiles];
                newFiles[index] = file;
                return { ...prevData, similarityFiles: newFiles };
            });
        }
    };

    const handleSimilarityWeightChange = (weight, index) => {
        setSimilarityData((prevData) => {
            const newWeights = [...prevData.similarityWeights];
            newWeights[index] = weight;
            return { ...prevData, similarityWeights: newWeights };
        });
    };

    const handleNetworkSelectionOptional = () => ({
        similarityData,
        handleOptionalFilesCountChange,
        handleSimilarityFileChange,
        handleSimilarityWeightChange,
    });

    const handleVersionChange = (e) => {
        const newVersion = e.target.value;
        setSanaVersion(newVersion);
        setOptions(defaultOptions[newVersion]);
    };

    // returning to allow set show alert on components if wanted
    const handleFileInputChange = (event, fileType) => {
        const file = event.target.files[0];
        if (file && validateFile(file, fileType)) {
            if (fileType === "network-file1") setFile1(file);
            else if (fileType === "network-file2") setFile2(file);
            return false;
        } else {
            return true;
        }
    };

    const validateFile = (file, fileType, isSimilarityFile = false) => {
        const extension = file.name.split(".").pop().toLowerCase();
        if (file.name.includes(" ")) {
            setFileError(`${fileType} file contains whitespace.`);
            return false;
        }
        if (!validExts.includes(extension)) {
            setFileError(`${fileType} file is not a valid network file.`);
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFileError(`${fileType} file exceeds 5MB.`);
            return false;
        }
        // VERIFY THAT FOLLOWING IS VALID
        if (isSimilarityFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split("\n");

                for (let line of lines) {
                    line = line.trim();
                    if (line === "") continue;

                    const columns = line.split(/\s+/);
                    if (columns.length !== 3) {
                        setFileError(
                            `${fileType} file does not follow the 3-column format.`
                        );
                        return false;
                    }
                    // more validation of content, but not sure what goes here
                }
            };
            reader.readAsText(file);
        }
        setFileError(null);
        return true;
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("files", file1);
        formData.append("files", file2);
        if (sanaVersion !== SanaVersions.SANA2) {
            formData.append(
                "options",
                JSON.stringify({
                    t: options.runtimeInMinutes,
                    s3: options.s3Weight,
                    ec: options.ecWeight,
                })
            );
        } else {
            formData.append(
                "options",
                JSON.stringify({
                    s3: options.s3Weight,
                    ec: options.ecWeight,
                    weightOfIcs: options.weightOfIcs,
                    targetTolerance: options.targetTolerance,
                })
            );
            // `Advanced Options` data submission
            /*
                External Similarity Weights
                An integer followed by that many weights, specifying objective function weights for external similarity files (must be the same integer as given to -simFile and -simFormat).
                External Similarity Filenames
                An integer (same integer as given to -esim and -simFormat) followed by that many filesnames, specifying external three-column (node from G1, node from G2, similarity) similarities. The similarities in the 3rd column will be normalized to be in [0,1]. These simFiles will be given weight according to the -esim argument
            */
            similarityData.similarityFiles.forEach((file, index) => {
                if (file) {
                    formData.append(`similarityFile${index + 1}`, file);
                    formData.append(
                        `similarityWeight${index + 1}`,
                        similarityData.similarityWeights[index]
                    );
                }
            });
        }
        formData.append("version", sanaVersion);

        try {
            const json = await api.upload(formData);
            if (json.redirect) {
                navigate(json.redirect);
            }
        } catch (error) {
            console.error("Submit Error:", error);
        }
    };

    const resetForm = () => {
        setFile1(null);
        setFile2(null);
        setFileError(null);
        // setShowAlert(false);
        setOptions(defaultOptions[sanaVersion]);
        setSimilarityData({
            optionalFilesCount: 0,
            similarityFiles: [],
            similarityWeights: [0, 0, 0],
        });
    };

    return (
        <JobSubmissionContext.Provider
            value={{
                options,
                sanaVersion,
                file1,
                file2,
                fileError,
                similarityData,
                handleOptionChange,
                handleVersionChange,
                handleFileInputChange,
                handleSubmit,
                resetForm,
                setSimilarityData,
                handleNetworkSelectionOptional,
                SanaVersions,
                defaultOptions,
                validExts,
                optionFields
            }}
        >
            {children}
        </JobSubmissionContext.Provider>
    );
}

export function useJobSubmission() {
    const location = useLocation();
    const context = useContext(JobSubmissionContext);
    if (context === undefined) {
        throw new Error('useJobSubmission must be used within a JobSubmissionProvider');
    }
    if (!location.pathname.startsWith('/submit-job')) {
        throw new Error('JobSubmission context can only be used within the submit-job route');
    }
    return context;
}
