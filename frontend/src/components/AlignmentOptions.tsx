// import { useEffect, useState } from "react";
// import { isSana1_1, isSana2, useJobSubmission } from "../context/JobSubmissionContext";
// import type { Options, Sana1_1Options, Sana1Options, Sana2Options } from "../context/JobSubmissionContext";


// const AlignmentOptions = ({ fixed = false }: { fixed: boolean }) => {
//     const { handleOptionChange, options, optionFields } = useJobSubmission();
//     // const [optionValues, setOptionValues] = useState<Options>(options);
//     const [optionValues, setOptionValues] = useState<Options>(() => {
//         if (isSana2(options)) return options as Sana2Options;
//         if (isSana1_1(options)) return options as Sana1_1Options;
//         return options as Sana1Options;
//     });
//     const [tempValues, setTempValues] = useState<Options>(() => {
//         if (isSana2(options)) return options as Sana2Options;
//         if (isSana1_1(options)) return options as Sana1_1Options;
//         return options as Sana1Options;
//     });
//     const getVersionKeys = (opt: Options): string[] => {
//         if (isSana2(opt)) {
//             const sana2Keys: Array<keyof Sana2Options> = ['s3Weight', 'ecWeight', 'weightOfIcs', 'targetTolerance'];
//             return sana2Keys;
//         }
//         const runtimeKeys: Array<keyof (Sana1Options | Sana1_1Options)> = ['runtimeInMinutes', 's3Weight', 'ecWeight'];
//         return runtimeKeys;
//     };


//     const handleInputChange = (key: keyof RuntimeKeys | keyof Sana2Keys, value: string) => {
//         if (value === "") {
//             setTempValues((prev) => ({
//                 ...prev,
//                 [key]: "",
//             }));
//             return;
//         }
//         const numValue = Number(value);
//         if (!isNaN(numValue)) {
//             let newValue = numValue;
    
//             if (key === "runtimeInMinutes" && 
//                 ('runtimeInMinutes' in options) && 
//                 (options.version === "SANA1" || options.version === "SANA1_1")) {
//                 newValue = Math.max(1, Math.min(20, numValue));
//             }
    
//             setTempValues((prev) => ({
//                 ...prev,
//                 [key]: newValue,
//             }));
//         }
//     };

//     const handleBlur = (key: keyof Options) => {
//         const finalValue = tempValues[key] === "" ? 0 : Number(tempValues[key]);
//         setOptionValues((prev) => ({
//             ...prev,
//             [key]: finalValue,
//         }));
//         setTempValues((prev) => ({
//             ...prev,
//             [key]: finalValue,
//         }));
//     };

//     useEffect(() => {
//         handleOptionChange(optionValues);
//     }, [optionValues, handleOptionChange]);

//     return (
//         <div className="mt-5">
//             <div>
//                 <h2 className="text-4xl">Network Alignment Options</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 m-8">
//                 {getVersionKeys(options).map((key) => (
//                         <div
//                             key={key}
//                             className="flex items-center justify-between space-x-2"
//                             title={optionFields[key]?.title || ""}
//                         >
//                             <label htmlFor={key}>
//                                 {optionFields[key]?.label || key}
//                             </label>
//                             <input
//                                 name={key}
//                                 type="number"
//                                 // value={tempValues[key]}
//                                 value={tempValues[key as keyof typeof tempValues]}
//                                 onChange={(e) =>
//                                     // handleInputChange(key, e.target.value)
//                                     handleInputChange(key as keyof Options, e.target.value)

//                                 }
//                                 // onBlur={() => handleBlur(key)}
//                                 onBlur={() => handleBlur(key as keyof Options)}
//                                 style={{
//                                     width: "100px",
//                                     marginBlock: "auto",
//                                     backgroundColor: fixed
//                                         ? "#d3d3d3"
//                                         : "white",
//                                 }}
//                                 disabled={fixed}
//                             />
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AlignmentOptions;
import { useEffect, useState } from "react";
import { isSana2, useJobSubmission } from "../context/JobSubmissionContext";
import type { Options } from "../context/JobSubmissionContext";

const AlignmentOptions = ({ fixed = false }: { fixed?: boolean }) => {
    const { handleOptionChange, options, optionFields } = useJobSubmission();
    
    // Use a generic type state with current SANA version
    const [optionValues, setOptionValues] = useState<Options>(options);
    const [tempValues, setTempValues] = useState<Options>(options);

    // Get the appropriate keys based on version
    const getVersionKeys = (): string[] => {
        if (isSana2(options)) {
            return ['s3Weight', 'ecWeight', 'weightOfIcs', 'targetTolerance'];
        }
        return ['runtimeInMinutes', 's3Weight', 'ecWeight'];
    };

    // Type-safe version of handleInputChange
    const handleInputChange = (key: string, value: string) => {
        if (value === "") {
            setTempValues((prev) => ({
                ...prev,
                [key]: "",
            }));
            return;
        }
        
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            let newValue = numValue;
    
            // Ensure runtime is bounded for SANA1/SANA1_1
            if (key === "runtimeInMinutes" && 
                !isSana2(options) && 
                'runtimeInMinutes' in options) {
                newValue = Math.max(1, Math.min(20, numValue));
            }
    
            setTempValues((prev) => ({
                ...prev,
                [key]: newValue,
            }));
        }
    };

    const handleBlur = (key: string) => {
        if(key === 'version') return;
        if (key in tempValues) {
            const tempValue = tempValues[key as keyof typeof tempValues];
            if(tempValue === 'SANA1' || tempValue === 'SANA1_1' || tempValue === 'SANA2'){
                return;
            }
            const finalValue = typeof tempValue === 'string' && tempValue === "" ? 0 : Number(tempValue);

            
            setOptionValues((prev) => ({
                ...prev,
                [key]: finalValue,
            }));
            
            setTempValues((prev) => ({
                ...prev,
                [key]: finalValue,
            }));
        }
    };

    useEffect(() => {
        handleOptionChange(optionValues);
    }, [optionValues, handleOptionChange]);

    // Get the appropriate keys for this SANA version
    const versionKeys = getVersionKeys();

    return (
        <div className="mt-5">
            <div>
                <h2 className="text-4xl">Network Alignment Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 m-8">
                {versionKeys.map((key) => (
                    <div
                        key={key}
                        className="flex items-center justify-between space-x-2"
                        title={optionFields[key]?.title || ""}
                    >
                        <label htmlFor={key}>
                            {optionFields[key]?.label || key}
                        </label>
                        <input
                            name={key}
                            type="number"
                            value={tempValues[key as keyof typeof tempValues] === undefined ? 
                                  "" : tempValues[key as keyof typeof tempValues]}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            onBlur={() => handleBlur(key)}
                            style={{
                                width: "100px",
                                marginBlock: "auto",
                                backgroundColor: fixed ? "#d3d3d3" : "white",
                            }}
                            disabled={fixed}
                        />
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export default AlignmentOptions;
