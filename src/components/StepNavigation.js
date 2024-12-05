import React from "react";
import { Steps, stepNames } from "../pages/SubmitJob";

const StepNavigation = ({ activeStep }) => {
    // set bg-gray-50 to current title

    return (
        <div id="steps-container" className="bg-gray-300 mt-4 w-full mx-auto">
            <ul id="steps" className="text-center text-[#778899]">
                {Object.keys(Steps).map((stepKey) => {
                    const step = Steps[stepKey];
                    return (
                        <li
                            key={step}
                            className={`step p-2 ${step} ${
                                // activeStep === step ? "bg-gray-50 " : ""
                                activeStep === step
                                ? "bg-gray-200 relative"
                                : ""
                            }`}
                        >
                            {activeStep === step && (
                              <span className="absolute left-2 my-auto">{'>'}</span>
                            )}
                            <span className="arrow">&nbsp;</span>
                            <span className="mt-6 text-md font-normal py-4">
                                {stepNames[step]}
                            </span>
                            {activeStep === step && (
                              <span className="absolute right-2 my-auto">{'<'}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default StepNavigation;

/* 
<li className="step select-networks active visited">
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
<span className="mt-6 text-xl font-normal">
    Preprocessing
</span>
</li> */



// {
//   @extend .hidden;
//   position: absolute;
//   top: 0;
//   left: 0;
//   height: 40px;
//   border-top: 20px solid transparent;
//   border-bottom: 20px solid transparent;
//   border-left: 20px solid $white;
// }