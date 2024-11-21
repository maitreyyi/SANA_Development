import React from "react";

const NetworkSelection = ({handleFileInputChange, validateFile}) => {
  return(
  <div class="content select-networks active visited">
    <div id="network-selection-prompt" className = "mt-4">
      <p className="text-gray-800">Please select two networks to align. Allowed file types are:</p>
      <ul className="list-disc list-inside ml-4 text-gray-700">
        <li><strong>LEDA</strong> → <code className="text-blue-600">.gw</code></li>
        <li><strong>ELISP</strong> → <code className="text-blue-600">.el</code></li>
      </ul>
    </div>
    <div id="network-selection-note" className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm mt-4">
      <h2 className="text-lg font-bold text-yellow-800 mb-2">NOTE</h2>
      <span className="text-gray-800 block mb-2">Please note the following:</span>
      <ul className="list-disc list-inside ml-4 text-gray-700">
        <li>The networks must be of the same file type.</li>
        <li>If you would like to align a network against itself, select the same file twice.</li>
        <li>The first network must be smaller than or equal to the second network in terms of the number of nodes.</li>
        <li>Files must be less than or equal to 1MB.</li>
        <li>You can specify how much time SANA runs (up to 20 minutes).</li>
      </ul>
    </div>
    <div id="network-file-input-wrapper" className="mt-6 space-y-6">
			<div className="flex flex-col md:flex-row items-center">
				<div className="md:w-1/2 mb-4 md:mb-0">
					<span className="text-gray-800">If you aren't aligning a network to itself, select the <strong><em>smaller</em></strong> network (in terms of node count).</span>
				</div>
				<div className="md:w-1/2">
          <input type="file" id="network-file-1-input" className="file-input border rounded-md shadow-sm p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600" name="network-files[]" ></input>
        </div>
			</div>
			<div className="flex flex-col md:flex-row items-center">
				<div className="md:w-1/2 mb-4 md:mb-0">
				  <span className="text-gray-800">If you aren't aligning a network to itself, select the <strong><em>larger</em></strong> network (in terms of node count).</span>
				</div>
				<div className="md:w-1/2">
					<input type="file" id="network-file-2-input" className="file-input border rounded-md shadow-sm p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600" name="network-files[]"></input>
				</div>
			</div>
		</div>
  </div>);
};

export default NetworkSelection;
