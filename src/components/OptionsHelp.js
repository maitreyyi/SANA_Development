import React from "react";

const OptionsHelp = ({handleBack, handleNext }) => {
  return (
  <div className="flex flex-col md:flex-row items-center">
    <div id="options-help-menu" className="bg-gray-100 p-6 rounded-lg shadow-md">
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
