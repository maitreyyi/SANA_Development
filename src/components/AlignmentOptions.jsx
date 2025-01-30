import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useJobSubmission } from "../context/JobSubmissionContext";

const AlignmentOptions = ({ fixed = false }) => {
    const { handleOptionChange, options, optionFields } = useJobSubmission();
    const [optionValues, setOptionValues] = useState(options);
    const [tempValues, setTempValues] = useState(options);
    const handleInputChange = (key, value) => {
        if (value === "") {
            setTempValues((prev) => ({
                ...prev,
                [key]: "",
            }));
            return;
        }
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            const newValue =
                key === "runtimeInMinutes"
                    ? Math.max(1, Math.min(20, numValue))
                    : numValue;
            setTempValues((prev) => ({
                ...prev,
                [key]: newValue,
            }));
        }
    };

    const handleBlur = (key) => {
        const finalValue = tempValues[key] === "" ? 0 : Number(tempValues[key]);
        setOptionValues((prev) => ({
            ...prev,
            [key]: finalValue,
        }));
        setTempValues((prev) => ({
            ...prev,
            [key]: finalValue,
        }));
    };

    useEffect(() => {
        handleOptionChange(optionValues);
    }, [optionValues, handleOptionChange]);

    return (
        <div className="mt-5">
            <div>
                <h2 className="text-4xl">Network Alignment Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 m-8">
                    {Object.keys(options).map((key) => (
                        <div
                            key={key}
                            className="flex items-center justify-between space-x-2"
                            title={optionFields[key]?.title || ""}
                        >
                            <label htmlFor={key}>
                                {optionFields[key]?.label || key}
                            </label>
                            <input
                                name={key}
                                type="number"
                                value={tempValues[key]}
                                onChange={(e) =>
                                    handleInputChange(key, e.target.value)
                                }
                                onBlur={() => handleBlur(key)}
                                style={{
                                    width: "100px",
                                    marginBlock: "auto",
                                    backgroundColor: fixed
                                        ? "#d3d3d3"
                                        : "white",
                                }}
                                disabled={fixed}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

AlignmentOptions.propTypes = {
    fixed: PropTypes.bool,
};

export default AlignmentOptions;
