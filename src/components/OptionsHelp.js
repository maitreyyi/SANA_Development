import React from "react";

const OptionsHelp = ({handleBack, handleNext }) => {
  return (
  <div className="content options">
    <div id="options-help-menu" className="panel callout">
      <h2>Options Help</h2>
      <span>Hover over an option to see its description or click the button to view the entire help menu.</span>
      <button id="options-help-menu-button" className="button radius">
        <span>+ Show Options Help Menu</span>
      </button>
    </div>
    <div className="page-flipper">
      <button type="button" onClick={handleBack} className="prev-page button radius">
        <span>&larr; Back</span>
      </button>
      <button type="button" onClick={handleNext} className="next-page button radius">
        <span>Next &rarr;</span>
      </button>
    </div>
  </div>
  );
};

export default OptionsHelp;
