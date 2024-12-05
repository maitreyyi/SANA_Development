import { useEffect, useState, useCallback }  from 'react';
import ConfirmationNote from "../components/ConfirmationNote.js";
import JavaScriptWarning from "../components/JavaScriptWarning.js";
import NetworkSelection from "../components/NetworkSelection.js";
import OptionsHelp from "../components/OptionsHelp.js";
import ProcessingStep from "../components/ProcessingStep.js";
import StepNavigation from "../components/StepNavigation.js";
import PageFlipper from "../components/PageFlipper.js";
import Button from "../components/Button.js";
import SelectVersion from '../components/SelectVersion.js';
import Alert from "../components/Alert.js";
import api from '../api/api.js';
import { useNavigate } from "react-router";


export const Steps = {
  SELECT_NETWORKS: 'select-networks',
  OPTIONS: 'options',
  CONFIRM: 'confirm',
  PROCESSING: 'processing'
};

export const stepNames = {
  [Steps.SELECT_NETWORKS]: 'Select Networks',
  [Steps.OPTIONS]: 'Options',
  [Steps.CONFIRM]: 'Confirm',
  [Steps.PROCESSING]: 'Processing'
};

const SubmitJob = () => {
    const [jsEnabled, setJsEnabled ] = useState(false);
    const [activeStep, setActiveStep] = useState(Steps.SELECT_NETWORKS);
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [formData, setFormData] = useState(new FormData());
    const [showAlert, setShowAlert] = useState(false);
    const [options, setOptions] = useState({
      runtimeInMinutes: 3,
      s3Weight: 0,
      ecWeight: 0
    });
    const validExts = ["gw", "el"];
    const navigate = useNavigate();

    const handleOptionChange = useCallback((runtimeInMinutes, s3Weight, ecWeight) => {
      setOptions(prev => ({
        ...prev,
        runtimeInMinutes,
        s3Weight, 
        ecWeight
      }));
    }, [setOptions]);

    const resetForm = () => {
      setFile1(null);
      setFile2(null);
      setFileError(null);
      setFormData(new FormData());
      setShowAlert(false);
      setOptions({
          runtimeInMinutes: 3,
          s3Weight: 0,
          ecWeight: 0
      });
  };

    const handleNext = () =>{
        if (activeStep === Steps.SELECT_NETWORKS) {
            if(file1 && file2){
              console.log(file1, file2);//TESTING
              setActiveStep(Steps.OPTIONS);
            }else{
              const whichFile = file1 ? 'second' : 'first';
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
    
    const handleBack= () => {
        if (activeStep === Steps.OPTIONS) {
            setActiveStep(Steps.SELECT_NETWORKS);
            resetForm();
        } else if (activeStep === Steps.CONFIRM) {
            setActiveStep(Steps.OPTIONS);
        }
    };

    // Handle file input changes
    const handleFileInputChange = (event, fileType) => {
        const file = event.target.files[0];
        if (file && validateFile(file, fileType)) {
            if (fileType === "network-file1") setFile1(file);
            else if (fileType === "network-file2") setFile2(file);
            setShowAlert(false);
        } else {
          setShowAlert(true);
        }
    };

    const validateFile = (file, fileType) => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (file.name.includes(' ')) {
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
        setFileError(null);
        return true;
    };

    // const handleFormSubmit = async (event) => {
    //     event.preventDefault();
    //     const data = new FormData(event.target);
    //     setFormData(data);

    //     try {
    //       const response = await fetch('', {
    //         method: 'POST',
    //         body: formData,
    //       });
    //       const result = await response.json();
    //       if (result.success) {
    //         window.location = result.data.url;
    //       } else {
    //         alert(result.status);
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       alert('Error processing the form.');
    //     }
    // };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const { runtimeInMinutes, s3Weight, ecWeight } = options;
      const formData = new FormData();
      formData.append('files', file1);
      formData.append('files', file2);
      formData.append('options', JSON.stringify({
        t: runtimeInMinutes,
        s3: s3Weight,
        ec: ecWeight
      }));
      try {
        const json = await api.upload(formData);
        console.log(json);
        // redirect to `/process/jobId`
        const jobId = json.jobId;
        navigate(`/process/${jobId}`);
        // or try getting link from backend --- naww
      } catch (error) {
        console.error('Submit Error:', error);
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
               {showAlert && <Alert message = {fileError} onClose = {() => setShowAlert(false)} />}
                <div>
                  <header>
                    <h1 className='text-4xl font-bold mt-4'>Submit New Job</h1>
                  </header>
                  <hr />
                  <StepNavigation activeStep={activeStep} />
                </div>
                <div id="content-container">
                  <form id="submit-new-job-form" method="POST" encType="multipart/form-data" action=".">
                    <div className='mb-4'>
                      {activeStep === Steps.SELECT_NETWORKS && (
                        <>
                          <NetworkSelection 
                            handleFileInputChange={handleFileInputChange} 
                          />
                          <PageFlipper handleNext={handleNext} disabled={showAlert}/>
                        </>
                      )}            
                      {activeStep === Steps.OPTIONS && (
                        <>
                          <OptionsHelp handleOptionChange={handleOptionChange} options={options}/>
                          <PageFlipper handleNext={handleNext} handlePrevious={handleBack}/>
                        </>
                      )}
                      {activeStep === Steps.CONFIRM && (
                        <>
                          <ConfirmationNote handleOptionChange={handleOptionChange} options={options} />
                          <PageFlipper handleNext={handleNext} handlePrevious={handleBack} nextText='Submit' />
                        </>
                        
                      )}
                      {activeStep === Steps.PROCESSING && (
                        <>
                          <ProcessingStep />
                          <PageFlipper handlePrevious={handleBack}/>
                          {/* <Button type="submit" onClick={(handleFormSubmit)}/> */}
                          <Button type="submit"/>
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