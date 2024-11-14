import React from "react";

const ConfirmationNote = ({visible, handleBack }) => {
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
    <div className="page-flipper">
      <button type="button" onClick={handleBack} className="prev-page button radius">
        <span>&larr; Back</span>
      </button>
      <button type="submit" className="next-page button radius">
        <span>Submit &rarr;</span>
      </button>
    </div>
  </div>);
};

export default ConfirmationNote;
