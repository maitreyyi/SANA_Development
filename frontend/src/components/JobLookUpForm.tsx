import { useState } from "react";
import {
  buttonClasses,
  containerClasses,
  headingTwoClasses,
  inputClasses,
  labelClasses,
} from "../utils/tailwindClasses";
import { ErrorResponse, isLookupJobResponse, LookupJobSuccessResponse } from "../api/apiValidation";
import { API_URL } from '../api/api.ts';

function JobLookUpForm() {
  const [jobID, setJobID] = useState("");
  const [jobData, setJobData] = useState<LookupJobSuccessResponse | null>(null); // To store fetched job data
  const [error, setError] = useState<ErrorResponse | null>(null); // To handle errors
  const [loading, setLoading] = useState<boolean>(false); // For loading state

  async function submit() {
    if (!jobID) return; // Don't submit if job ID is empty

    setLoading(true);
    setError(null);
    setJobData(null);

    try {
      const url = `${API_URL}/jobs/${jobID}`;
      console.log("url is: ", url);
      const response = await fetch(url);
      console.log("response is: ", response);
      if (!response.ok) {
        throw new Error("Job not found");
      }

      const data = await response.json();
      console.log("data is: ", data);
      setJobData(data); // Save job data in state
    } catch (err) {
      setError({
        message: (err as Error).message ?? 'Error Submitting',
        errorLog: (err as Error).message ?? 'Error Submitting',
        error: true
      }
      ); // Handle error if job not found or failed
    } finally {
      setLoading(false);
    }
  }

  const renderJobDetails = () => {
    if (!jobData || !isLookupJobResponse(jobData)) return null;

    const { status, zip_name, error_log, exec_log } = jobData;
    

    // if (status === "preprocessed" || status === "processing") {
    if (status === "redirect") {
      return (
        <div>
          <p>The job is still being processed. Please wait...</p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div>
          <div className="panel callout">
            <h2>Job Successfully Processed!</h2>
            <span>
              These results JSON Data can be accessed {" "}
              <a href={`${API_URL}/jobs/${jobID}`}>here</a>.
            </span>
          </div>
          <a
            href={`${API_URL}/jobs/${jobID}/zip`}
            className={`${buttonClasses}`}
          >
            Download Results As .zip
          </a>
          {exec_log && (
            <div id="exec-log-file-output">
              <pre>{exec_log}</pre>
            </div>
          )}
        </div>
      );
    }

    if (status === "error") {
      return (
        <div>
          <p>The job failed. The error log is:</p>
          <pre>{error_log}</pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`${containerClasses}`}>
      <h2 className={`${headingTwoClasses}`}>Job Lookup</h2>
      <div className="space-y-4">
        <label className={`${labelClasses}`}>Job ID To Search For:</label>
        <input
          type="text"
          placeholder="Previous Job ID"
          value={jobID}
          onChange={(e) => setJobID(e.target.value)}
          className={`${inputClasses}`}
        />
        <button
          onClick={submit}
          className={`${buttonClasses}`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
        {error && <p className="text-red-500">{error.message}</p>}
        {renderJobDetails()}
      </div>
    </div>
  );
}

export default JobLookUpForm;
