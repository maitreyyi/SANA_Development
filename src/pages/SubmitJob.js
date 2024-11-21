import React, { useEffect, useState }  from 'react';
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

const SubmitJob = () => {
    const [jsEnabled, setJsEnabled ] = useState(false);
    const [activeStep, setActiveStep] = useState('select-networks');
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [formData, setFormData] = useState(new FormData());
    const [showAlert, setShowAlert] = useState(true);

    const validExts = ["gw", "el"];

    const handleNext = () =>{
        if (activeStep === 'select-networks') {
            setActiveStep('options');
          } else if (activeStep === 'options') {
            setActiveStep('confirm');
          } else if (activeStep === 'confirm') {
            setActiveStep('processing');
          }
    };
    
    const handleBack= () => {
        if (activeStep === 'options') {
            setActiveStep('select-networks');
        } else if (activeStep === 'confirm') {
            setActiveStep('options');
        }
    };

    // Handle file input changes
    const handleFileInputChange = (event, fileType) => {
        const file = event.target.files[0];
        if (file && validateFile(file, fileType)) {
            if (fileType === "Network-file1") setFile1(file);
            else if (fileType === "Network-file2") setFile2(file);
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

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        setFormData(data);

        try {
          const response = await fetch('', {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          if (result.success) {
            window.location = result.data.url;
          } else {
            alert(result.status);
          }
        } catch (error) {
          console.error(error);
          alert('Error processing the form.');
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
              <div className="page-content-wrapper">
               {showAlert && <Alert message = {fileError} onClose = {() => setShowAlert(false)} />}
                <header>
                  <h1 className='text-4xl font-bold mt-4'>Submit New Job</h1>
                </header>
                <hr />
                <StepNavigation/>
                <div id="content-container">
                  <form id="submit-new-job-form" method="POST" encType="multipart/form-data" action=".">
                    {activeStep === 'select-networks' && (
                      <div>
                        <NetworkSelection 
                          handleFileInputChange={handleFileInputChange} 
                        />
                        <PageFlipper handleNext={handleNext} disabled={showAlert}/>
                      </div>
                    )}            
                    {activeStep === 'options' && (
                      <div>
                        <OptionsHelp />
                        <PageFlipper handleNext={handleNext} handlePrevious={handleBack}/>
                      </div>
                    )}
                    {activeStep === 'confirm' && (
                      <div>
                        <ConfirmationNote />
                        <PageFlipper handleNext={handleNext} handlePrevious={handleBack}/>
                      </div>
                      
                    )}
                    {activeStep === 'processing' && (
                      <div>
                        <ProcessingStep />
                        <PageFlipper handlePrevious={handleBack}/>
                        <Button type="submit" onClick={handleFormSubmit}/>
                      </div>  
                    )}
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