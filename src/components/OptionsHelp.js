import React from "react";

const OptionsHelp = ({}) => {
  return (
  <div className="flex flex-col md:flex-row items-center">
    <div id="options-help-menu" className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2>Options Help</h2>
      <span>Hover over an option to see its description or click the button to view the entire help menu.</span>
      <button id="options-help-menu-button" className="button radius">
        <span>+ Show Options Help Menu</span>
      </button>
    </div>
  </div>
  );
};

export default OptionsHelp;
