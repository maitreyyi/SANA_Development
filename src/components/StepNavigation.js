import React from "react";

const StepNavigation = () => (
  <div id="steps-container">
    <ul id="steps">
      <li className="step select-networks active visited">
        <span className="arrow">&nbsp;</span>
        <span>Select Networks</span>
      </li>
      <li className="step options">
        <span className="arrow">&nbsp;</span>
        <span>Options</span>
      </li>
      <li className="step confirm">
        <span className="arrow">&nbsp;</span>
        <span>Confirm</span>
      </li>
      <li className="step process">
        <span className="arrow">&nbsp;</span>
        <span>Preprocessing</span>
      </li>
    </ul>
  </div>
);

export default StepNavigation;
