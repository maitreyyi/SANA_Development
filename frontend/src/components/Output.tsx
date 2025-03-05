import { Link, useNavigate } from "react-router";
import Note from "./Note";
import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import api from "../api/api";
import parse from "html-react-parser";
import {
    GetJobResultResponse,
    ProcessJobResponse,
    ErrorResponse,
    isErrorResponse,
    isJobRedirectResponse,
    isJobResultsResponse,
} from "../api/apiValidation";

interface OutputProps {
    jobId: string;
    isFinished: boolean;
}

const Output = ({ jobId, isFinished }: OutputProps) => {
    const resultUrl = `${window.location.origin}/lookup-job`;
    const processUrl = `${window.location.origin}/submit-job`;
    const [jobData, setJobData] = useState<GetJobResultResponse | null>(null);
    const [error, setError] = useState<ErrorResponse | null>(null);
    const [logOutput, setLogOutput] = useState<string>("");
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
            const data: GetJobResultResponse = await api.getJobResult(jobId);
            console.log("api.getjobresult:", data); //TESTING
            if (isErrorResponse(data)) {
                setError(data);
                setLogOutput(data.errorLog);
            } else if (isJobRedirectResponse(data)) {
                navigate(data.redirect);
            } else if (isJobResultsResponse(data)) {
                setJobData(data);
                setLogOutput(data.execLogFileOutput);
            }
        } catch (err) {
            setError({
                message: `Failed to fetch job data: ${(err as Error).message}`,
                errorLog: `Failed to fetch job data: ${(err as Error).message}`,
                error: true,
            });
        }
    }, [jobId, navigate]);

    const fetchProcess = useCallback(async () => {
        try {
            const data: ProcessJobResponse = await api.process(jobId);
            if (isErrorResponse(data)) {
                setError(data);
                setLogOutput(data.errorLog);
            } else if (isJobRedirectResponse(data)) {
                navigate(data.redirect);
            } else if (isJobResultsResponse(data)) {
                if (
                    data.success &&
                    data.status === "Networks already aligned."
                ) {
                    navigate(`/lookup-job/${jobId}`);
                    return;
                }
                setJobData(data);
                setLogOutput(data.execLogFileOutput);
            }
        } catch (error) {
            setError({
                message: `Failed to process job: ${(error as Error).message}`,
                errorLog: `Failed to process job: ${(error as Error).message}`,
                error: true,
            });
        }
    }, [jobId, navigate]);

    useEffect(() => {
        console.log("useEffect triggered"); //TESTING
        if (isFinished) {
            fetchJobData();
        }
        let intervalId: ReturnType<typeof setInterval>;
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

    // const {
    //     execLogFileOutput,
    //     jobId: jobIdField,
    //     message,
    //     note,
    //     zipDownloadUrl,
    // } = jobData || {} as Partial<GetJobResultResponse>;

    const modifiedExecLogFileOutput = logOutput
        ? logOutput
              .replace(/<span>/g, "<span className='block mb-1'>")
              .replace(
                  /<span className='block mb-1'>===/g,
                  "<span className='block mb-1 text-4xl'>==="
              )
        : "";

    return (
        <div>
            <h1 className="text-4xl font-bold mt-4 mx-auto md:mx-0">
                {isFinished ? "Job Results" : "Processing Job"}
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
                    {isFinished &&
                        jobData &&
                        isJobResultsResponse(jobData) &&
                        jobData.zipDownloadUrl && (
                            <Button
                                className="w-fit mt-4 mx-auto md:mx-0"
                                onClick={downloadZipFile}
                            >
                                Download Results As .zip
                            </Button>
                        )}

                    <div>
                        {jobData &&
                            isJobResultsResponse(jobData) &&
                            jobData.execLogFileOutput && (
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

export default Output;
