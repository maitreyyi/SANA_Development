import React from "react";
import Button from "../components/Button.js";

const PageFlipper = ({ handleNext, handlePrevious, disabled = false, nextText = 'Next' }) => (
    <div className="flex justify-between">
        {handlePrevious && (
            <Button onClick={handlePrevious} className="bg-red-600 hover:bg-red-800">
                <span>&larr; Previous</span>
            </Button>
        )}
        {handleNext && (
            <Button
                onClick={handleNext}
                className={`next-page button radius bg-green-700 hover:bg-green-900 ${!handlePrevious ? "ml-auto" : ""}`}
                disabled={disabled}
            >
                <span>{nextText} &rarr;</span>
            </Button>
        )}
    </div>
);

export default PageFlipper;
