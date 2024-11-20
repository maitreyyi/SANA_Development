import React from "react";

const StepNavigation = () => (
  <div id="steps-container" className= "bg-gray-200 mt-4">
    <ul id="steps">
      <li className="bg-gray-50" class="step select-networks active visited">
        <span className="arrow">&nbsp;</span>
        <span className="mt-6 text-xl font-normal">Select Networks</span>
      </li>
      <li className="step options">
        <span className="arrow">&nbsp;</span>
        <span className="mt-6 text-xl font-normal">Options</span>
      </li>
      <li className="step confirm">
        <span className="arrow">&nbsp;</span>
        <span className="mt-6 text-xl font-normal">Confirm</span>
      </li>
      <li className="step process">
        <span className="arrow">&nbsp;</span>
        <span className="mt-6 text-xl font-normal">Preprocessing</span>
      </li>
    </ul>
  </div>
);

export default StepNavigation;
