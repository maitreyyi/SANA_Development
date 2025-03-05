import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router";
import api from "../api/api";

/* For future coder!
    Make sure to ask and explicitly write the ranges for all the options. 
    Also make sure to ensure the api requests and responses are correct.
    Currently in the process of switching to laravel so I did not handle that part yet.
*/

interface SanaVersionsType {
    SANA1: "SANA1";
    SANA1_1: "SANA1_1";
    SANA2: "SANA2";
}

// START-OF-OPTIONS--------------------------------------------------------

interface OptionField {
    label: string;
    title: string;
}

interface Sana1Options {
    runtimeInMinutes: number;
    s3Weight: number;
    ecWeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Sana1_1Options extends Sana1Options {}

interface Sana2Options extends Omit<Sana1Options, "runtimeInMinutes"> {
    weightOfIcs: number;
    targetTolerance: number;
}

type Options = Sana1Options | Sana1_1Options | Sana2Options;

interface DefaultOptions {
    [SanaVersions.SANA1]: Sana1Options;
    [SanaVersions.SANA1_1]: Sana1_1Options;
    [SanaVersions.SANA2]: Sana2Options;
}

// First, define interface for ranges/constraints
interface OptionRanges {
    runtimeInMinutes: {
        min: number;
        max: number;
    };
    s3Weight: {
        min: number;
        max: number;
    };
    ecWeight: {
        min: number;
        max: number;
    };
    weightOfIcs: {
        min: number;
        max: number;
    };
    targetTolerance: {
        min: number;
        max: number;
    };
}

const optionRanges: OptionRanges = {
    runtimeInMinutes: { min: 1, max: 20 },
    s3Weight: { min: 0, max: 1 },
    ecWeight: { min: 0, max: 1 },
    weightOfIcs: { min: 0, max: 1 },
    targetTolerance: { min: 0, max: 1 },
} as const;

// const isSana2Options = (options: Options): options is Sana2Options => {
//     return 'weightOfIcs' in options && 'targetTolerance' in options;
// };

// const isSana1_1Options = (options: Options): options is Sana1_1Options => {
//     return 'runtimeInMinutes' in options;
// };

// const isSana1Options = (options: Options): options is Sana1Options => {
//     return 'runtimeInMinutes' in options;
// };

// END-OF-OPTIONS----------------------------------------------------------

interface SimilarityData {
    optionalFilesCount: number;
    similarityFiles: (File | null)[];
    similarityWeights: number[];
}

interface JobSubmissionContextType {
    options: Options;
    sanaVersion: keyof SanaVersionsType;
    file1: File | null;
    file2: File | null;
    fileError: string | null;
    similarityData: SimilarityData;
    handleOptionChange: (optionValues: Partial<Options>) => void;
    handleVersionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleFileInputChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        fileType: string
    ) => Promise<boolean>;
    handleSubmit: () => Promise<void>;
    resetForm: () => void;
    setSimilarityData: React.Dispatch<React.SetStateAction<SimilarityData>>;
    handleNetworkSelectionOptional: () => {
        similarityData: SimilarityData;
        handleOptionalFilesCountChange: (
            event: React.ChangeEvent<HTMLInputElement>
        ) => void;
        handleSimilarityFileChange: (
            event: React.ChangeEvent<HTMLInputElement>,
            index: number
        ) => Promise<void>;
        handleSimilarityWeightChange: (weight: number, index: number) => void;
    };
    SanaVersions: SanaVersionsType;
    defaultOptions: DefaultOptions;
    validExts: string[];
    optionFields: Record<string, OptionField>;
}

const JobSubmissionContext = createContext<JobSubmissionContextType | null>(
    null
);

type SanaVersion = (typeof SanaVersions)[keyof typeof SanaVersions];

const SanaVersions: SanaVersionsType = {
    SANA1: "SANA1",
    SANA1_1: "SANA1_1",
    SANA2: "SANA2",
} as const satisfies SanaVersionsType;

function assertSanaVersion(version: string): asserts version is SanaVersion {
    if (
        version !== SanaVersions.SANA1 &&
        version !== SanaVersions.SANA1_1 &&
        version !== SanaVersions.SANA2
    ) {
        throw new Error(`Invalid Sana version: ${version}`);
    }
}

// type SanaVersionsType = typeof SanaVersions;

const defaultOptions: DefaultOptions = {
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
} as const satisfies DefaultOptions;

function validateOptionValue<T extends keyof OptionRanges>(
    option: T,
    value: number
): boolean {
    const range = optionRanges[option];
    return value >= range.min && value <= range.max;
}

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
const validExts = ["gw", "el", "txt", "csv", "tsv"];

export function JobSubmissionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const navigate = useNavigate();
    const [options, setOptions] = useState<Options>(
        defaultOptions[SanaVersions.SANA1]
    );
    const [sanaVersion, setSanaVersion] = useState<SanaVersion>(
        SanaVersions.SANA1
    );
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [similarityData, setSimilarityData] = useState<SimilarityData>({
        optionalFilesCount: 0,
        similarityFiles: [null, null, null],
        similarityWeights: [0, 0, 0],
    });

    const handleOptionChange = useCallback((optionValues: Partial<Options>) => {
        Object.entries(optionValues).forEach(([key, value]) => {
            if (
                typeof value === "number" &&
                !validateOptionValue(key as keyof OptionRanges, value)
            ) {
                throw new Error(
                    `Invalid value for ${key}. Must be between ${
                        optionRanges[key as keyof OptionRanges].min
                    } and ${optionRanges[key as keyof OptionRanges].max}`
                );
            }
        });

        setOptions((prevData) => ({
            ...prevData,
            ...optionValues,
        }));
    }, []);

    const handleOptionalFilesCountChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0 && value <= 3) {
            setSimilarityData((prevData) => ({
                ...prevData,
                optionalFilesCount: value,
                // Initialize arrays with the correct length
                similarityFiles: new Array(value).fill(null),
                similarityWeights: new Array(value).fill(0),
            }));
        }
    };

    const validateFile = (
        file: File,
        fileType: string,
        isSimilarityFile: boolean = false
    ) => {
        return new Promise<boolean>((resolve) => {
            const extension = file.name.split(".").pop()?.toLowerCase() || "";
            if (file.name.includes(" ")) {
                setFileError(`${fileType} file contains whitespace.`);
                resolve(false);
                return;
            }
            if (!validExts.includes(extension)) {
                setFileError(`${fileType} file is not a valid network file.`);
                resolve(false);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setFileError(`${fileType} file exceeds 5MB.`);
                resolve(false);
                return;
            }

            if (isSimilarityFile) {
                const reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    const content = e.target?.result;
                    if (!content || typeof content !== "string") {
                        setFileError(`Error reading ${fileType} file content`);
                        resolve(false);
                        return;
                    }
                    const lines = content.split("\n");

                    // Skip first line if it's a single number (header)
                    let startIndex = 0;
                    const firstLine = lines[0].trim();
                    if (/^\d+$/.test(firstLine)) {
                        startIndex = 1;
                    }

                    // Validate each data line
                    for (let i = startIndex; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line === "") continue;

                        const columns = line.split(/\s+/);
                        if (columns.length !== 3) {
                            setFileError(
                                `${fileType} file line ${
                                    i + 1
                                } does not follow the node1 node2 score format`
                            );
                            resolve(false);
                            return;
                        }
                    }
                    setFileError(null);
                    resolve(true);
                };
                reader.onerror = () => {
                    setFileError(`Error reading ${fileType} file`);
                    resolve(false);
                };
                reader.readAsText(file);
            } else {
                setFileError(null);
                resolve(true);
            }
        });
    };

    const handleSimilarityFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const file = event.target.files?.[0];
        console.log("Handling file change:", {
            index,
            fileCount: similarityData.optionalFilesCount,
            similarityFiles: similarityData.similarityFiles,
            file: file,
        });
        if (file) {
            const isValid = await validateFile(
                file,
                `similarity-file${index + 1}`,
                true
            );
            if (isValid) {
                setSimilarityData((prevData) => {
                    const newFiles = [...prevData.similarityFiles];
                    newFiles[index] = file;
                    console.log("Updated files:", newFiles);
                    return { ...prevData, similarityFiles: newFiles };
                });
            } else {
                event.target.value = "";
                alert(fileError || "Invalid file format");
            }
        }
        console.log("similarityFiles after:", similarityData.similarityFiles); //TESTING
    };

    const handleSimilarityWeightChange = (weight: number, index: number) => {
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
    const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVersion = e.target.value;
        assertSanaVersion(newVersion);
        setSanaVersion(newVersion);
        setOptions(defaultOptions[newVersion]);
    };

    // returning to allow set show alert on components if wanted
    const handleFileInputChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        fileType: string
    ) => {
        const file = event.target.files?.[0];
        if (!file) return false;
        try {
            const isValid = await validateFile(file, fileType);
            if (isValid) {
                if (fileType === "network-file1") setFile1(file);
                else if (fileType === "network-file2") setFile2(file);
                return true; // Success should return true
            }
            return false; // Validation failed
        } catch (error) {
            console.error("File validation error:", error);
            return false;
        }
    };

    // const validateFile = (file, fileType, isSimilarityFile = false) => {
    //     const extension = file.name.split(".").pop().toLowerCase();
    //     if (file.name.includes(" ")) {
    //         setFileError(`${fileType} file contains whitespace.`);
    //         return false;
    //     }
    //     if (!validExts.includes(extension)) {
    //         setFileError(`${fileType} file is not a valid network file.`);
    //         return false;
    //     }
    //     if (file.size > 5 * 1024 * 1024) {
    //         setFileError(`${fileType} file exceeds 5MB.`);
    //         return false;
    //     }
    //     // VERIFY THAT FOLLOWING IS VALID
    //     if (isSimilarityFile) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             const content = e.target.result;
    //             const lines = content.split("\n");

    //             for (let line of lines) {
    //                 line = line.trim();
    //                 if (line === "") continue;

    //                 const columns = line.split(/\s+/);
    //                 if (columns.length !== 3) {
    //                     setFileError(
    //                         `${fileType} file does not follow the 3-column format.`
    //                     );
    //                     return false;
    //                 }
    //                 // more validation of content, but not sure what goes here
    //             }
    //         };
    //         reader.readAsText(file);
    //     }
    //     setFileError(null);
    //     return true;
    // };

    const formatOptions = (
        options: Options,
        version: keyof SanaVersionsType
    ) => {
        if (version === SanaVersions.SANA2) {
            return {
                standard: {
                    s3: options.s3Weight,
                    ec: options.ecWeight,
                    ics: (options as Sana2Options).weightOfIcs,
                    tolerance: (options as Sana2Options).targetTolerance,
                },
                advanced: {
                    esim: similarityData.similarityWeights,
                },
            };
        }

        // For SANA1 and SANA1_1
        return {
            standard: {
                t: (options as Sana1Options).runtimeInMinutes,
                s3: options.s3Weight,
                ec: options.ecWeight,
            },
        };
    };

    const handleSubmit = async () => {
        if (!file1 || !file2) {
            setFileError("Please upload both network files.");
            return;
        }
        const formData = new FormData();
        formData.append("files", file1);
        formData.append("files", file2);
        formData.append("version", sanaVersion);

        const formattedOptions = formatOptions(options, sanaVersion);
        formData.append("options", JSON.stringify(formattedOptions));

        if (sanaVersion === SanaVersions.SANA2) {
            similarityData.similarityFiles.forEach((file) => {
                if (file) {
                    formData.append("similarityFiles", file);
                }
            });

            // log SANA2 specific data
            console.log("SANA2 Submission Data:", {
                version: sanaVersion,
                networkFile1: file1?.name,
                networkFile2: file2?.name,
                options: formattedOptions,
                similarityFiles: similarityData.similarityFiles
                    .filter((f) => f)
                    .map((f) => f?.name),
            });
        }

        // log FormData contents
        console.log("FormData contents:");
        for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        // if (sanaVersion !== SanaVersions.SANA2) {
        //     formData.append(
        //         "options",
        //         JSON.stringify({
        //             standard: {
        //                 t: options.runtimeInMinutes,
        //                 s3: options.s3Weight,
        //                 ec: options.ecWeight,
        //             }
        //         })
        //     );
        // } else {
        //     const sana2Options = {
        //         standard: {
        //             s3: options.s3Weight,
        //             ec: options.ecWeight,
        //             ics: options.weightOfIcs,
        //             tolerance: options.targetTolerance,
        //         },
        //         advanced: {
        //             esim: similarityData.similarityWeights
        //         },
        //     };
        //     formData.append("options", JSON.stringify(sana2Options));
        //     // `Advanced Options` data submission
        //     /*
        //         External Similarity Weights
        //         An integer followed by that many weights, specifying objective function weights for external similarity files (must be the same integer as given to -simFile and -simFormat).
        //         External Similarity Filenames
        //         An integer (same integer as given to -esim and -simFormat) followed by that many filesnames, specifying external three-column (node from G1, node from G2, similarity) similarities. The similarities in the 3rd column will be normalized to be in [0,1]. These simFiles will be given weight according to the -esim argument
        //     */
        //     // similarityData.similarityFiles.forEach((file, index) => {
        //     //     if (file) {
        //     //         formData.append(`similarityFile${index + 1}`, file);
        //     //         formData.append(
        //     //             `similarityWeight${index + 1}`,
        //     //             similarityData.similarityWeights[index]
        //     //         );
        //     //     }
        //     // });
        //     similarityData.similarityFiles.forEach((file, i) => {
        //         if(file){
        //             formData.append('similarityFiles', file);
        //         }
        //     });
        //     // formData.append(
        //     //     'similarityWeights',
        //     //     JSON.stringify(similarityData.similarityWeights.filter((_, index) =>
        //     //         similarityData.similarityFiles[index]
        //     //     ))
        //     // );
        //     // Log everything being sent
        //     console.log('SANA2 Submission Data:', {
        //         version: sanaVersion,
        //         networkFile1: file1?.name,
        //         networkFile2: file2?.name,
        //         options: sana2Options,
        //         similarityFiles: similarityData.similarityFiles
        //             .filter(f => f)
        //             .map(f => f.name),
        //     });

        //     // Log FormData contents (since FormData is not directly loggable)
        //     console.log('FormData contents:');
        //     for (let pair of formData.entries()) {
        //         console.log(pair[0], pair[1]);
        //     }
        // }
        // formData.append("version", sanaVersion);

        try {
            const json = await api.upload(formData);
            console.log("jobSubmission api.upload", json); //TESTING
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
            similarityFiles: [null, null, null],
            similarityWeights: [0, 0, 0],
        });
    };

    useEffect(() => {
        console.log("useeffect:", similarityData.similarityFiles); //TESTING
    }, [similarityData.similarityFiles]);

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
                optionFields,
            }}
        >
            {children}
        </JobSubmissionContext.Provider>
    );
}

export function useJobSubmission() {
    const location = useLocation();
    const context = useContext(JobSubmissionContext);
    if (!context) {
        throw new Error(
            "useJobSubmission has to be used within <JobSubmission.Provider>"
        );
    }
    if (!location.pathname.startsWith("/submit-job")) {
        throw new Error(
            "JobSubmission context can only be used within the submit-job route"
        );
    }
    return context;
}
