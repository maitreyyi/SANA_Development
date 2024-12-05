import React, { useState } from "react";
import Button from "./Button";
import AlignmentOptions from "./AlignmentOptions";
import PropTypes from "prop-types";

const OptionsHelp = ({ handleOptionChange, options }) => {
    const [optionsShow, setOptionsShow] = useState(false);

    return (
        <div className="w-full mx-auto">
            <div
                id="options-help-menu"
                className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm mt-4"
                // className="bg-zinc-300 border border-1 border-slate-500 p-6  shadow-md flex flex-col items-center mx-auto gap-2"
            >
                {/* <h2 className="text-3xl w-full">Options Help</h2> */}
                <h2 className="text-lg font-bold text-yellow-800 mb-2">NOTE</h2>
                <p className="w-full">
                    Hover over an option to see its description or click the
                    button to view the entire help menu.
                </p>
                {/* <span className="w-full">Hover over an option to see its description or click the button to view the entire help menu.</span> */}
                <div className="w-full">
                    <Button
                        id="options-help-menu-button"
                        className="button radius"
                        onClick={() => setOptionsShow(!optionsShow)}
                    >
                        {optionsShow ? "- " : "+ "}
                        <span>Show Options Help Menu</span>
                    </Button>
                    {optionsShow && (
                        <div className="w-full">
                            <hr />
                            <h2 className="text-2xl">
                                Standard Network Alignment Options
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8">
                                <p className="text-lg">Runtime in minutes</p>
                                <p>
                                    The weight of the Symmetric Substructer
                                    Score in the objective function.
                                </p>
                                <p className="text-lg">S3 weight</p>
                                <p>
                                    The weight of the Symmetric Substructer
                                    Score in the objective function.
                                </p>
                                <p className="text-lg">EC weight</p>
                                <p>
                                    The weight of the Edge Coverage in the
                                    objective function.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <AlignmentOptions
                handleOptionChange={handleOptionChange}
                options={options}
            />
        </div>
    );
};

OptionsHelp.propTypes = {
    handleOptionChange: PropTypes.func,
    options: PropTypes.shape({
        runtimeInMinutes: PropTypes.number.isRequired,
        s3Weight: PropTypes.number.isRequired,
        ecWeight: PropTypes.number.isRequired,
    }).isRequired,
};

export default OptionsHelp;
