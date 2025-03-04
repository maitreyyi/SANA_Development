import { Link, useNavigate } from "react-router-dom";
import Note from "../components/Note";
import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import api from "../api/api";
import PropTypes from "prop-types";
import parse from "html-react-parser";

const Output = ({ jobId, isFinished }) => {
    const resultUrl = `${window.location.origin}/lookup-job`;
    const processUrl = `${window.location.origin}/submit-job`;
    const [jobData, setJobData] = useState(null);
    const [error, setError] = useState(null);
    const [logOutput, setLogOutput] = useState("");
    const navigate = useNavigate();

    const downloadZipFile = async () => {
        try {
            const blob = await api.downloadJobZip(jobId);
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${jobId}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
        }
    };

    const fetchJobData = useCallback(async () => {
        try {
            const data = await api.getJobResult(jobId);
            console.log('api.getjobresult:', data); //TESTING
            if (data.error) {
                setError({
                    message: data.message,
                    errorLog: data.errorLog ? data.errorLog : null,
                });
                setLogOutput(data.errorLog ?? null);
                console.log("hello");
            } else if (data.redirect) {
                navigate(data.redirect);
            } else {
                setJobData(data);
                setLogOutput(prev => data.execLogFileOutput ?? '');
                // setLogOutput((prev) => prev + (data.execLogFileOutput || "")); //TESTING ? might just overwrite instead but we'll see
            }
        } catch (err) {
            setError(`Failed to fetch job data: ${err.message}`);
        }
    }, [jobId, navigate]);

    const fetchProcess = useCallback(async() => {
        try {
            const data = await api.process(jobId);
            if(data.success && data.status === 'Networks already aligned.'){
                navigate(`/lookup-job/${jobId}`);
            }
            console.log('fetchProcess data:', data); //TESTING
            if (data.error) {
                setError({
                    message: data.message,
                    errorLog: data.errorLog ? data.errorLog : null,
                });
                setLogOutput(data.errorLog ?? null);
                console.log("hello");
            } else if (data.redirect) {
                navigate(data.redirect);
            } else {
                setJobData(data);
                setLogOutput(data.execLogFileOutput ?? '');
            }
        } catch (error) {
            console.error(error);//TESTING
        }
    }, [jobId, navigate]);

    useEffect(() => {
        console.log("useEffect triggered"); //TESTING
        if(isFinished){
            fetchJobData();
        }
        let intervalId;
        if (!isFinished) {
            fetchProcess();
            intervalId = setInterval(fetchProcess, 3000); // fetch every 3 seconds;
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchJobData, fetchProcess, isFinished]);


    // useEffect(() => {
    //     if(!isFinished){

    //     }
    // }, [isFinished, jobId, navigate]);

    const {
        execLogFileOutput,
        jobId: jobIdField,
        message,
        note,
        zipDownloadUrl,
    } = jobData || {};

    const modifiedExecLogFileOutput = logOutput
        ? logOutput
              .replace(/<span>/g, "<span className='block mb-1'>")
              .replace(
                  /<span className='block mb-1'>===/g,
                  "<span className='block mb-1 text-4xl'>==="
              )
        : "";

    // const logOutput = error ? error.errorLog ?? "" : execLogFileOutput;
    // const modifiedExecLogFileOutput = logOutput
    //     ? logOutput
    //           .replace(/<span>/g, "<span className='block mb-1'>")
    //           .replace(
    //               /<span className='block mb-1'>===/g,
    //               "<span className='block mb-1 text-4xl'>==="
    //           )
    //     : "";

    return (
        <div>
            <h1 className="text-4xl font-bold mt-4 mx-auto md:mx-0">
                {isFinished ? 'Job Results' : 'Processing Job'}
            </h1>
            <hr />
            <h2 className="mt-2 mx-auto md:mx-0">Job ID: {jobId}</h2>

            {error ? (
                <div>
                    <Note>
                        <p id="results-note" className="panel callout">
                            These process can maybe be accessed on the direct{" "}
                            <Link
                                to={processUrl + `/${jobId}`}
                                className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                                submit-job processing page
                            </Link>
                        </p>
                    </Note>
                    <h2 className="text-lg mt-2 font-bold">{error.message}</h2>
                    <div>
                        {" "}
                        {error.errorLog && (
                            <div className="mb-5">
                                {parse(modifiedExecLogFileOutput)}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <Note>
                        <p id="results-note" className="panel callout">
                            These results can be accessed on{" "}
                            <Link
                                to={resultUrl}
                                className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                                the job lookup page
                            </Link>{" "}
                            using the above Job ID, or directly accessed using{" "}
                            <Link
                                to={resultUrl + `/${jobId}`}
                                className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                                this link
                            </Link>
                            .
                        </p>
                    </Note>
                    {isFinished && zipDownloadUrl && (
                        <Button
                            className="w-fit mt-4 mx-auto md:mx-0"
                            onClick={downloadZipFile}
                        >
                            Download Results As .zip
                        </Button>
                    )}

                    <div>
                        {execLogFileOutput && (
                            <div className="mb-5">
                                {parse(modifiedExecLogFileOutput)}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

Output.propTypes = {
    jobId: PropTypes.string.isRequired,
    isFinished: PropTypes.bool.isRequired,
};

export default Output;
