import React from "react";

const NetworkSelection = ({handleFileInputChange, handleNext}) => {
  return(
  <div className="content select-networks active visited">
    <div id="network-selection-prompt">
      <p>Please select two networks to align. Allowed file types are:</p>
      <ul className="circle">
        <li>LEDA → .gw</li>
        <li>ELISP → .el</li>
      </ul>
    </div>
    <div id="network-selection-note" className="panel callout">
      <h2>NOTE</h2>
      <span>Please note the following:</span>
      <ul className="circle">
        <li>The networks must be of the same file type.</li>
        <li>If you would like to align a network against itself, select the same file twice.</li>
        <li>The first network must be smaller than or equal to the second network in terms of the number of nodes.</li>
        <li>Files must be less than or equal to 1MB.</li>
        <li>You can specify how much time SANA runs (up to 20 minutes).</li>
      </ul>
    </div>
    <div id="network-file-input-wrapper">
			<div class="row">
				<div class="columns small-12 medium-6">
					<span>If you aren't aligning a network to itself, select the <strong><em>smaller</em></strong> network (in terms of node count).</span>
				</div>
				<div class="columns small-12 medium-6">
          <input type="file" id="network-file-1-input" class="file-input" name="network-files[]" disabled></input>
        </div>
			</div>
			<div class="row">
				<div class="columns small-12 medium-6">
				  <span>If you aren't aligning a network to itself, select the <strong><em>larger</em></strong> network (in terms of node count).</span>
				</div>
				<div class="columns small-12 medium-6">
					<input type="file" id="network-file-2-input" class="file-input" name="network-files[]" disabled></input>
				</div>
			</div>
		</div>
  </div>);
};

export default NetworkSelection;
