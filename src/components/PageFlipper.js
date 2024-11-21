import React from "react";

const PageFlipper = ({ handleNext, handlePrevious}) => (
  <div className="page-flipper">
    <button type="button" onClick={handlePrevious} className="prev-page button radius" disabled={!handlePrevious}>
      <span>Previous &rarr;</span>
    </button>
    <button type="button" onClick={handleNext} className="next-page button radius">
      <span>Next &rarr;</span>
    </button>
  </div>
);

export default PageFlipper;
