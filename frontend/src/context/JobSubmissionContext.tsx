import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { z } from "zod";
import api from "../api/api";
import { ApiError } from "../api/api";
import Papa from "papaparse";

const SanaVersionsArray = ["SANA1", "SANA1_1", "SANA2"] as const;
const SanaVersionsSchema = z.enum(SanaVersionsArray);
export type SanaVersion = (typeof SanaVersionsArray)[number];


// Option ranges schema with validation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OptionRangesSchema = z.object({
    runtimeInMinutes: z.object({
        min: z.number(),
        max: z.number(),
    }),
    s3Weight: z.object({
        min: z.number(),
        max: z.number(),
    }),
    ecWeight: z.object({
        min: z.number(),
        max: z.number(),
    }),
    weightOfIcs: z.object({
        min: z.number(),
        max: z.number(),
    }),
    targetTolerance: z.object({
        min: z.number(),
        max: z.number(),
    }),
});

type OptionRanges = z.infer<typeof OptionRangesSchema>;

const optionRanges: OptionRanges = {
    runtimeInMinutes: { min: 1, max: 20 },
    s3Weight: { min: 0, max: 1 },
    ecWeight: { min: 0, max: 1 },
    weightOfIcs: { min: 0, max: 1 },
    targetTolerance: { min: 0, max: 1 },
};

// Option field schema
const OptionFieldSchema = z.object({
    label: z.string(),
    title: z.string(),
});

type OptionField = z.infer<typeof OptionFieldSchema>;

// Common properties schema
const CommonOptionsSchema = z.object({
    s3Weight: z
        .number()
        .min(optionRanges.s3Weight.min)
        .max(optionRanges.s3Weight.max),
    ecWeight: z
        .number()
        .min(optionRanges.ecWeight.min)
        .max(optionRanges.ecWeight.max),
});

const RuntimeOptionsSchema = z.object({
    runtimeInMinutes: z
        .number()
        .min(optionRanges.runtimeInMinutes.min)
        .max(optionRanges.runtimeInMinutes.max),
});

const Sana2SpecificSchema = z.object({
    weightOfIcs: z
        .number()
        .min(optionRanges.weightOfIcs.min)
        .max(optionRanges.weightOfIcs.max),
    targetTolerance: z
        .number()
        .min(optionRanges.targetTolerance.min)
        .max(optionRanges.targetTolerance.max),
});

// Specific version schemas
const Sana1OptionsSchema = CommonOptionsSchema.merge(
    RuntimeOptionsSchema
).extend({
    version: z.literal("SANA1"),
});

const Sana1_1OptionsSchema = CommonOptionsSchema.merge(
    RuntimeOptionsSchema
).extend({
    version: z.literal("SANA1_1"),
});

const Sana2OptionsSchema = CommonOptionsSchema.merge(
    Sana2SpecificSchema
).extend({
    version: z.literal("SANA2"),
});

const OptionsSchema = z.discriminatedUnion("version", [
    Sana1OptionsSchema,
    Sana1_1OptionsSchema,
    Sana2OptionsSchema,
]);

export type Sana1Options = z.infer<typeof Sana1OptionsSchema>;
export type Sana1_1Options = z.infer<typeof Sana1_1OptionsSchema>;
export type Sana2Options = z.infer<typeof Sana2OptionsSchema>;
export type Options = z.infer<typeof OptionsSchema>;

// Use Record<SanaVersion, Zod Schema> to define the schema
const DefaultOptionsSchema: z.ZodSchema<
    Record<
        SanaVersion,
        z.infer<
            | typeof Sana1OptionsSchema
            | typeof Sana1_1OptionsSchema
            | typeof Sana2OptionsSchema
        >
    >
> = z.object({
    SANA1: Sana1OptionsSchema,
    SANA1_1: Sana1_1OptionsSchema,
    SANA2: Sana2OptionsSchema,
});

type DefaultOptions = z.infer<typeof DefaultOptionsSchema>;

// // Union type for all options
// const OptionsSchema = z.union([
//     Sana1OptionsSchema,
//     Sana1_1OptionsSchema,
//     Sana2OptionsSchema,
// ]);

// type Sana1Options = z.infer<typeof Sana1OptionsSchema>;
// type Sana1_1Options = z.infer<typeof Sana1_1OptionsSchema>;
// type Sana2Options = z.infer<typeof Sana2OptionsSchema>;
// export type Options = z.infer<typeof OptionsSchema>;

// Similarity data schema
const SimilarityDataSchema = z.object({
    optionalFilesCount: z.number().min(0).max(3),
    similarityFiles: z.array(z.instanceof(File).nullable()),
    similarityWeights: z.array(z.number().min(0).max(1)),
});

type SimilarityData = z.infer<typeof SimilarityDataSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JobSubmissionContextSchema = z.object({
    options: OptionsSchema,
    sanaVersion: SanaVersionsSchema,
    file1: z.instanceof(File).nullable(),
    file2: z.instanceof(File).nullable(),
    fileError: z.array(z.string()).nullable(),
    // fileError: z.string().nullable(),
    similarityData: SimilarityDataSchema,
    handleOptionChange: z
        .function()
        .args(
            z.union([
                Sana1OptionsSchema.omit({ version: true }).partial(),
                Sana1_1OptionsSchema.omit({ version: true }).partial(),
                Sana2OptionsSchema.omit({ version: true }).partial(),
            ])
        )
        .returns(z.void()),
    handleVersionChange: z
        .function()
        .args(z.custom<React.ChangeEvent<HTMLSelectElement>>())
        .returns(z.void()),
    handleFileInputChange: z
        .function()
        .args(z.custom<React.ChangeEvent<HTMLInputElement>>(), z.string())
        .returns(z.promise(z.boolean())),
    handleSubmit: z.function().returns(z.promise(z.void())),
    resetForm: z.function().returns(z.void()),
    setSimilarityData: z.function().args(z.any()).returns(z.void()),
    handleNetworkSelectionOptional: z.function().returns(
        z.object({
            similarityData: SimilarityDataSchema,
            handleOptionalFilesCountChange: z
                .function()
                .args(z.custom<React.ChangeEvent<HTMLSelectElement>>())
                .returns(z.void()),
            handleSimilarityFileChange: z
                .function()
                .args(
                    z.custom<React.ChangeEvent<HTMLInputElement>>(),
                    z.number()
                )
                .returns(z.promise(z.void())),
            handleSimilarityWeightChange: z
                .function()
                .args(z.number(), z.number())
                .returns(z.void()),
        })
    ),
    defaultOptions: DefaultOptionsSchema,
    validExts: z.array(z.string()),
    optionFields: z.record(z.string(), OptionFieldSchema),
});

type JobSubmissionContextType = z.infer<typeof JobSubmissionContextSchema>;

// Create the context with null as default
const JobSubmissionContext = createContext<JobSubmissionContextType | null>(
    null
);

const defaultOptions: DefaultOptions = {
    SANA1: {
        version: "SANA1",
        runtimeInMinutes: 5,
        s3Weight: 1,
        ecWeight: 0,
    },
    SANA1_1: {
        version: "SANA1_1",
        runtimeInMinutes: 5,
        s3Weight: 1,
        ecWeight: 0,
    },
    SANA2: {
        version: "SANA2",
        s3Weight: 1,
        ecWeight: 0,
        weightOfIcs: 0,
        targetTolerance: 0.1,
    },
};

// Validate default options against schema
DefaultOptionsSchema.parse(defaultOptions);

// Option fields
const optionFields: Record<string, OptionField> = {
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

// Valid file extensions
const validExts = ["gw", "el", "txt", "csv", "tsv"];

export const isSana1 = (opt: Options): opt is Sana1Options =>
    opt.version === "SANA1";
export const isSana1_1 = (opt: Options): opt is Sana1_1Options =>
    opt.version === "SANA1_1";
export const isSana2 = (opt: Options): opt is Sana2Options =>
    opt.version === "SANA2";

export function JobSubmissionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const navigate = useNavigate();
    const [options, setOptions] = useState<Options>(defaultOptions["SANA1"]);
    const [sanaVersion, setSanaVersion] = useState<SanaVersion>("SANA1");
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string[] | null>([]);
    const [similarityData, setSimilarityData] = useState<SimilarityData>({
        optionalFilesCount: 0,
        similarityFiles: [null, null, null],
        similarityWeights: [0, 0, 0],
    });

    const handleOptionChange = useCallback(
        (optionValues: Record<string, number | undefined>) => {
            // Validate each option value with Zod
            try {
                Object.entries(optionValues).forEach(([key, value]) => {
                    if (typeof value === "number") {
                        const fieldSchema = z
                            .number()
                            .min(
                                optionRanges[key as keyof OptionRanges]?.min ||
                                    0
                            )
                            .max(
                                optionRanges[key as keyof OptionRanges]?.max ||
                                    1
                            );

                        fieldSchema.parse(value);
                    }
                });

                setOptions((prevData) => {
                    const newOptions = {
                        ...prevData,
                        ...optionValues,
                        version: prevData.version,
                    } as Options;

                    // validate changes
                    switch (sanaVersion) {
                        case "SANA1":
                            return Sana1OptionsSchema.parse(newOptions);
                        case "SANA1_1":
                            return Sana1_1OptionsSchema.parse(newOptions);
                        case "SANA2":
                            return Sana2OptionsSchema.parse(newOptions);
                        default:
                            throw new Error(
                                `Invalid SANA version: ${sanaVersion}`
                            );
                    }
                });
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.error("Validation error:", error.errors);
                    throw new Error(
                        `Invalid option value: ${error.errors[0].message}`
                    );
                }
                throw error;
            }
        },
        [sanaVersion]
    );

    const handleOptionalFilesCountChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = parseInt(event.target.value, 10);
        try {
            // Validate with Zod
            z.number().min(0).max(3).parse(value);

            setSimilarityData((prevData) => ({
                ...prevData,
                optionalFilesCount: value,
                // Initialize arrays with the correct length
                similarityFiles: Array(value)
                    .fill(null)
                    .concat(Array(3 - value).fill(null))
                    .slice(0, 3),
                similarityWeights: Array(value)
                    .fill(0)
                    .concat(Array(3 - value).fill(0))
                    .slice(0, 3),
            }));
        } catch (error) {
            console.error("Invalid optional files count:", error);
        }
    };

    const validateFile = (
        file: File,
        fileType: string,
        isSimilarityFile: boolean = false
    ) => {
        return new Promise<boolean>((resolve) => {
            try {
                // Basic file validation with Zod
                const FileSchema = z
                    .instanceof(File)
                    .refine((file) => !file.name.includes(" "), {
                        message: `${fileType} file contains whitespace\n`,
                    })
                    .refine(
                        (file) => {
                            const extension =
                                file.name.split(".").pop()?.toLowerCase() || "";
                            return validExts.includes(extension);
                        },
                        {
                            message: `${fileType} file is not a valid network file\n`,
                        }
                    )
                    .refine((file) => file.size <= 1 * 1024 * 1024, {
                        message: `${fileType} file exceeds 1MB\n`,
                    });

                FileSchema.parse(file);

                if (isSimilarityFile) {
                    Papa.parse(file, {
                        header: false,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const data = results.data;
                            const errors = results.errors;

                            if (errors.length > 0) {
                                const errorMessages = errors.map(error => error.message);
                                setFileError(errorMessages);
                                resolve(false);
                                return;
                            }

                            // Custom validation logic for the parsed data
                            try {
                                // Skip first line if it's a single number (header)
                                let startIndex = 0;
                                if (
                                    data.length > 0 &&
                                    typeof data[0] === "string" &&
                                    /^\d+$/.test(data[0])
                                ) {
                                    startIndex = 1;
                                }

                                for (let i = startIndex; i < data.length; i++) {
                                    const row = data[i];

                                    // Ensure row is an array and has 3 columns
                                    if (
                                        !Array.isArray(row) ||
                                        row.length !== 3 ||
                                        row.some(
                                            (cell) => typeof cell !== "string"
                                        )
                                    ) {
                                        throw new Error(
                                            `Line ${
                                                i + 1
                                            } does not follow the node1 node2 score format`
                                        );
                                    }

                                    // You can add more specific validation for each column here
                                    const [, , score] = row;

                                    // Example: Validate that the score is a number
                                    if (isNaN(Number(score))) {
                                        throw new Error(
                                            `Line ${
                                                i + 1
                                            }: Score is not a valid number`
                                        );
                                    }
                                }

                                setFileError(null);
                                resolve(true);
                            } catch (error) {
                                setFileError(
                                    error instanceof Error ? 
                                        [error.message]
                                        : [String(error)]
                                );
                                resolve(false);
                            }
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        error: (error: any) => {
                            setFileError(
                                [`${fileType} file: PapaParse error: ${error.message}`]
                            );
                            resolve(false);
                        },
                    });
                } else {
                    setFileError(null);
                    resolve(true);
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errorMessages = error.errors.map(error => error.message);
                    setFileError(errorMessages);
                } else {
                    setFileError(
                        [`Invalid ${fileType} file: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`]
                    );
                }
                resolve(false);
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
        console.log("similarityFiles after:", similarityData.similarityFiles);
    };

    const handleSimilarityWeightChange = (weight: number, index: number) => {
        try {
            // Validate weight with Zod
            z.number().min(0).max(1).parse(weight);

            setSimilarityData((prevData) => {
                const newWeights = [...prevData.similarityWeights];
                newWeights[index] = weight;
                return { ...prevData, similarityWeights: newWeights };
            });
        } catch (error) {
            console.error("Invalid similarity weight:", error);
        }
    };

    const handleNetworkSelectionOptional = () => ({
        similarityData,
        handleOptionalFilesCountChange,
        handleSimilarityFileChange,
        handleSimilarityWeightChange,
    });

    const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            const newVersion = e.target.value;

            // validate
            const versionSchema = z.enum(["SANA1", "SANA1_1", "SANA2"]);

            const validatedVersion = versionSchema.parse(
                newVersion
            ) as SanaVersion;
            setSanaVersion(validatedVersion);
            setOptions(defaultOptions[validatedVersion]);
        } catch (error) {
            console.error("Invalid SANA version:", error);
        }
    };
    useEffect(() => { // alert user if invalid file was uploaded
        if (!fileError || fileError.length == 0) return;
        let msg = "Invalid File\n";
        for (let err of fileError) {
            msg += err;
        }
        alert(msg);
    }, [fileError]);

    const handleFileInputChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        fileType: string
    ) => {
        const file = event.target.files?.[0];
        if (!file) return false;

        try {
            const isValid = await validateFile(file, fileType);
            console.log("Is valid: ", isValid);
            if (isValid) {
                if (fileType === "network-file1") {
                    console.log("setting file 1");
                    setFile1(file);
                }
                else if (fileType === "network-file2") setFile2(file);
                return true;
            }
            event.target.value = '';
            setFile1(null);
            setFile2(null);
            return false;
        } catch (error) {
            console.error("File validation error:", error);
            return false;
        }
    };

    const formatOptions = (options: Options, version: SanaVersion) => {
        try {
            if (version === "SANA2") {
                // Validate with Zod
                const sana2Options = Sana2OptionsSchema.parse(options);

                return {
                    standard: {
                        s3: sana2Options.s3Weight,
                        ec: sana2Options.ecWeight,
                        ics: sana2Options.weightOfIcs,
                        tolerance: sana2Options.targetTolerance,
                    },
                    advanced: {
                        esim: similarityData.similarityWeights,
                    },
                };
            }

            // For SANA1 and SANA1_1
            const sana1Options = Sana1OptionsSchema.parse(options);

            return {
                standard: {
                    t: sana1Options.runtimeInMinutes,
                    s3: sana1Options.s3Weight,
                    ec: sana1Options.ecWeight,
                },
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Invalid options: ${error.errors[0].message}`);
            }
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            // Validate required files
            if (!file1 || !file2) {
                setFileError(["Please upload both network files."]);
                return;
            }

            const formData = new FormData();
            formData.append("files", file1);
            formData.append("files", file2);
            formData.append("version", sanaVersion);

            const formattedOptions = formatOptions(options, sanaVersion);
            formData.append("options", JSON.stringify(formattedOptions));

            if (sanaVersion === "SANA2") {
                // Add similarity files if present
                similarityData.similarityFiles.forEach((file) => {
                    if (file) {
                        formData.append("similarityFiles", file);
                    }
                });

                // Log SANA2 specific data
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

            // Log FormData contents
            console.log("FormData contents:");
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            try {
                const response = await api.upload(formData);
                console.log("jobSubmission api.upload response:", response);

                if (response.redirect) {
                    navigate(response.redirect);
                }
            } catch (error) {
                if (error instanceof ApiError) {
                    setFileError([error.message]);
                } else {
                    setFileError(["An error occurred during submission"]);
                    console.error("Submit Error:", error);
                }
            }
        } catch (error) {
            setFileError(
                error instanceof Error
                    ? [error.message]
                    : ["An unexpected error occurred"]
            );
            console.error("Submit preparation error:", error);
        }
    };

    const resetForm = () => {
        setFile1(null);
        setFile2(null);
        setFileError(null);
        setOptions(defaultOptions[sanaVersion]);
        setSimilarityData({
            optionalFilesCount: 0,
            similarityFiles: [null, null, null],
            similarityWeights: [0, 0, 0],
        });
    };

    useEffect(() => {
        console.log(
            "useEffect: similarityFiles updated:",
            similarityData.similarityFiles
        );
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

    // Validate route
    const routeSchema = z.string().startsWith("/submit-job");
    try {
        routeSchema.parse(location.pathname);
    } catch (error) {
        throw new Error(
            `JobSubmission context can only be used within the submit-job route: ${error}`
        );
    }

    return context;
}
