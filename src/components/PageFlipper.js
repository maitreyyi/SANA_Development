import React from "react";

const PageFlipper = ({ handleNext }) => (
  <div className="page-flipper">
    <button type="button" onClick={handleNext} className="next-page button radius">
      <span>Next &rarr;</span>
    </button>
  </div>
);

export default PageFlipper;
