import React from "react";
import { useState } from "react";
import { buttonClasses, containerClasses, headingTwoClasses, inputClasses, labelClasses } from "../utils/tailwindClasses";

const API_ENDPOINT = "https://sana.ics.uci.edu/";

function JobLookUpForm() {
    const [jobID, setJobID] = useState("");

    async function submit() {
        const promise = await fetch(`${API_ENDPOINT}/get-jobs`); // temporary placeholder for now, but will replace when we implement the joblookup endpoint
        const data = await promise.json();

        // parse through data and display it on the frontend
    }

    return (
        // <div className='mx-auto text-center debug'>
        //     Job ID To Search For:
        //     <input type='text' placeholder='Previous Job ID' value={jobID} onChange={(e) => setJobID(e.target.value)} />
        //     <button onClick={submit}> Submit </button>
        // </div>
        <div className={`${containerClasses}`}>
            <h2 className={`${headingTwoClasses}`}>Job Lookup</h2>
            <div className="space-y-4">
                <label className={`${labelClasses}`}>
                    Job ID To Search For:
                </label>
                <input
                    type="text"
                    placeholder="Previous Job ID"
                    value={jobID}
                    onChange={(e) => setJobID(e.target.value)}
                    className={`${inputClasses}`}
                />
                <button onClick={submit} className={`${buttonClasses}`}>
                    Submit
                </button>
            </div>
        </div>
    );
}

export default JobLookUpForm;
