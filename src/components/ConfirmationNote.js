import React from "react";

const ConfirmationNote = ({visible}) => {
  if(!visible){
    return null;
  }

  return (
  <div className="content confirm">
    <div className="panel callout">
      <h2>NOTE</h2>
      <span>Please note the following:</span>
      <ul className="circle">
        <li>The networks will be aligned with the specified options.</li>
        <li>Faded values are default settings. To make changes, click the back button.</li>
      </ul>
    </div>
  </div>);
};

export default ConfirmationNote;
