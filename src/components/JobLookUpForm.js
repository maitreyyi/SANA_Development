
import React from 'react';
import { useState } from 'react';

const API_ENDPOINT = 'https://sana.ics.uci.edu/';

function JobLookUpForm() {
    const [jobID, setJobID] = useState("");

    async function submit() {
        const promise = await fetch(`${API_ENDPOINT}/get-jobs`); // temporary placeholder for now, but will replace when we implement the joblookup endpoint
        const data = await promise.json();

        // parse through data and display it on the frontend
    }

    return (
        <div>
            Job ID To Search For:
            <input type='text' placeholder='Previous Job ID' value={jobID} onChange={(e) => setJobID(e.target.value)} />
            <button onClick={submit}> Submit </button>



        </div>
    );
}

export default JobLookUpForm;
