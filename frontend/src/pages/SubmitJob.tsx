import { useEffect, useState } from "react";
import ConfirmationNote from "../components/ConfirmationNote";
import JavaScriptWarning from "../components/JavaScriptWarning";
import NetworkSelection from "../components/NetworkSelection";
import OptionsHelp from "../components/OptionsHelp";
import ProcessingStep from "../components/ProcessingStep";
import StepNavigation from "../components/StepNavigation";
import PageFlipper from "../components/PageFlipper";
import SelectVersion from "../components/SelectVersion";
import Alert from "../components/Alert";
import { useJobSubmission } from "../context/JobSubmissionContext.js";

// export const Steps = {
//     SELECT_VERSION: "select-version",
//     SELECT_NETWORKS: "select-networks",
//     OPTIONS: "options",
//     CONFIRM: "confirm",
//     PROCESSING: "processing",
// };

// export const stepNames = {
//     [Steps.SELECT_VERSION]: "Select Version",
//     [Steps.SELECT_NETWORKS]: "Select Networks",
//     [Steps.OPTIONS]: "Options",
//     [Steps.CONFIRM]: "Confirm",
//     [Steps.PROCESSING]: "Processing",
// };
export const STEP_IDS = [
    'select-version',
    'select-networks',
    'options',
    'confirm',
    'processing'
] as const;

export type StepType = typeof STEP_IDS[number];

// Helper function to format step labels
const formatStepLabel = (id: StepType): string => 
    id.split('-')
       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
       .join(' ');

// Create Steps object with uppercase keys for backward compatibility
export const Steps = Object.fromEntries(
    STEP_IDS.map(id => [
        id.toUpperCase().replace(/-/g, '_'),
        id
    ])
) as { [K: string]: StepType };

// Create stepNames mapping
export const stepNames = Object.fromEntries(
    STEP_IDS.map(id => [id, formatStepLabel(id)])
) as Record<StepType, string>;





const SubmitJob = () => {
    const [jsEnabled, setJsEnabled] = useState(false);
    const [activeStep, setActiveStep] = useState(Steps.SELECT_VERSION);
    const [showAlert, setShowAlert] = useState(false);
    const {
        sanaVersion,
        file1,
        file2,
        fileError,
        similarityData,
        handleVersionChange,
        handleSubmit,
        resetForm,
    } = useJobSubmission();

    const handleNext = () => {
        if (activeStep === Steps.SELECT_VERSION) {
            setActiveStep(Steps.SELECT_NETWORKS);
        } else if (activeStep === Steps.SELECT_NETWORKS) {
            if (file1 && file2) {
                if (
                    sanaVersion === 'SANA2' &&
                    similarityData.optionalFilesCount > 0
                ) {
                    const requiredFiles = similarityData.similarityFiles.slice(
                        0,
                        similarityData.optionalFilesCount
                    );
                    let validFileCount = 0;
                    
                    // const allRequiredFilesExist = (() => {
                    //     if (requiredFiles.length === 0) return false;
                    //     for (let i = 0; i < requiredFiles.length; i++) {
                    //         // console.log(`Checking index ${i}, file:`, requiredFiles[i]);
                    //         const file = requiredFiles[i];
                    //         if (file === null || file === undefined) {
                    //             return false;
                    //         }
                    //         if (
                    //             file instanceof File ||
                    //             (typeof file === "object" &&
                    //                 file.name &&
                    //                 typeof file.name === "string")
                    //         ) {
                    //             validFileCount++;
                    //         }
                    //     }
                    //     return validFileCount === requiredFiles.length;
                    // })();
                    const allRequiredFilesExist = (() => {
                        if (requiredFiles.length === 0) return false;
                        for (let i = 0; i < requiredFiles.length; i++) {
                            const file = requiredFiles[i];
                            if (file === null || file === undefined) {
                                return false;
                            }
                            // Add type guard to check if it's a File object
                            if (file instanceof File) {
                                validFileCount++;
                                continue;
                            }
                            // explicit type check for custom file-like objects
                            if (
                                typeof file === "object" && 
                                file !== null && 
                                'name' in file && 
                                typeof (file as { name: unknown }).name === "string"
                            ) {
                                validFileCount++;
                            }
                        }
                        return validFileCount === requiredFiles.length;
                    })();
                    // console.log('allRequiredFilesExist:', allRequiredFilesExist);//TESTING
                    if (!allRequiredFilesExist) {
                        console.log('similarityData:', similarityData)
                        alert(
                            `Please select all ${similarityData.optionalFilesCount} similarity files.`
                        );
                        return;
                    }
                }
                setActiveStep(Steps.OPTIONS);
            } else {
                const whichFile = file1 ? "second" : "first";
                alert(`The ${whichFile} file has not been selected.`);
            }
        } else if (activeStep === Steps.OPTIONS) {
            setActiveStep(Steps.CONFIRM);
        } else if (activeStep === Steps.CONFIRM) {
            setActiveStep(Steps.PROCESSING);
            // this is where i will send POST to api
            // api.process.preprocess
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (activeStep === Steps.SELECT_NETWORKS) {
            setActiveStep(Steps.SELECT_VERSION);
            resetForm();
        } else if (activeStep === Steps.OPTIONS) {
            setActiveStep(Steps.SELECT_NETWORKS);
        } else if (activeStep === Steps.CONFIRM) {
            setActiveStep(Steps.OPTIONS);
        }
    };

    useEffect(() => {
        setJsEnabled(true);
    }, []);

    return (
        <div>
            {!jsEnabled && <JavaScriptWarning />}
            {jsEnabled && (
                <div id="js-enabled">
                    <div id="query-page-content">
                        <div className="page-content-wrapper flex flex-col gap-4">
                            {showAlert && (
                                <Alert
                                    message={fileError ? fileError[0] : null}
                                    onClose={() => setShowAlert(false)}
                                />
                            )}
                            <div>
                                <header>
                                    <h1 className="text-4xl font-bold mt-4">
                                        Submit New Job
                                    </h1>
                                </header>
                                <hr />
                                <StepNavigation activeStep={activeStep} />
                            </div>
                            <div id="content-container">
                                <form
                                    id="submit-new-job-form"
                                    method="POST"
                                    encType="multipart/form-data"
                                    action="."
                                >
                                    <div className="mb-4">
                                        {activeStep ===
                                            Steps.SELECT_VERSION && (
                                            <>
                                                <SelectVersion
                                                    sanaVersion={sanaVersion}
                                                    handleVersionChange={
                                                        handleVersionChange
                                                    }
                                                />
                                                <PageFlipper
                                                    handleNext={handleNext}
                                                    disabled={showAlert}
                                                />
                                            </>
                                        )}
                                        {activeStep ===
                                            Steps.SELECT_NETWORKS && (
                                            <>
                                                <NetworkSelection />
                                                <PageFlipper
                                                    handleNext={handleNext}
                                                    handlePrevious={handleBack}
                                                />
                                            </>
                                        )}
                                        {activeStep === Steps.OPTIONS && (
                                            <>
                                                <OptionsHelp />
                                                <PageFlipper
                                                    handleNext={handleNext}
                                                    handlePrevious={handleBack}
                                                />
                                            </>
                                        )}
                                        {activeStep === Steps.CONFIRM && (
                                            <>
                                                <ConfirmationNote />
                                                <PageFlipper
                                                    handleNext={handleNext}
                                                    handlePrevious={handleBack}
                                                    nextText="Submit"
                                                />
                                            </>
                                        )}
                                        {activeStep === Steps.PROCESSING && (
                                            <>
                                                <ProcessingStep />
                                                {/* <PageFlipper handlePrevious={handleBack}/> */}
                                                {/* <Button type="submit" onClick={(handleFormSubmit)}/> */}
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmitJob;
