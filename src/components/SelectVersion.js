import React from "react";


const SelectVersion = () => (
  <div id = "select-version" className= "bg-gray-200 mt-4">
    <div id ="version-selection-prompt">
        <h3>Choose which version of SANA you would like to run</h3>
        <span>The default version of SANA that you can use is SANA 2.0</span>
    </div>
    <div id = "version-selection">
        <select id = "version">
            <option value = "SANA 2.0">SANA 2.0</option>
            <option value = "SANA 2.0">SANA 1.1</option>
            <option value = "SANA 2.0">SANA 1.0.0</option>
        </select>
    </div>
  </div>
);

export default SelectVersion;
