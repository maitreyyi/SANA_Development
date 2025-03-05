
const Fallback = ({ isResults } : { isResults?: boolean }) => {
    return (
        <div className="text-center flex items-center justify-center mb-20 h-full">
            <h2 className="text-xl font-bold">Job ID Required</h2>
            <p>Please provide a job ID in the URL to view the results.</p>
            <p className="text-gray-500">
                Example:{" "}
                <span className="text-blue-500">
                    https://sana.ics.uci.edu/{isResults ? 'lookup-job': 'submit-job'}/o3iu145145435243
                </span>
            </p>
        </div>
    );
};

export default Fallback;
