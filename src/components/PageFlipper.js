import React from "react";
import Button from "../components/Button.js";

const PageFlipper = ({ handleNext, handlePrevious, disabled = false}) => (
  <div className="page-flipper">
    {handlePrevious && <Button onClick={handlePrevious}>
      <span>Previous &larr;</span>
    </Button>}

    {handleNext && <Button onClick={handleNext} className="next-page button radius" disabled = {disabled}>
      <span>Next &rarr;</span>
    </Button>}
  </div>
);

export default PageFlipper;
