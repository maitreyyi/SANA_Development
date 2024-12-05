import { useEffect, useState } from "react";
import PropTypes from 'prop-types';

const AlignmentOptions = ({
    handleOptionChange,
    options,
    fixed = false,
}) => {
    const { runtimeInMinutes: runtimeInMinutesInit, s3Weight: s3WeightInit, ecWeight: ecWeightInit } = options;
    const [runtimeInMinutes, setRuntimeInMinutes] = useState(runtimeInMinutesInit);
    const [s3Weight, setS3Weight] = useState(s3WeightInit);
    const [ecWeight, setEcWeight] = useState(ecWeightInit);

    const handleRuntimeChange = (e) => {
        const { value } = e.target;
        const valueCheck = Math.max(1, Math.min(60, value));
        setRuntimeInMinutes(valueCheck);
    };

    const handleChange = (setter) => (e) => {
        const { value } = e.target;
        setter(Number(value));
    };

    useEffect(() => {
        handleOptionChange(runtimeInMinutes, s3Weight, ecWeight);
    }, [runtimeInMinutes, s3Weight, ecWeight, handleOptionChange]);


    return (
        <div className="mt-5">
            <div>
                <h2 className="text-4xl">Standard Network Alignment Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 m-8">
                    <div
                        className="flex items-center justify-between space-x-2"
                        title="The number of minutes to run SANA. Must be an integer between 1 and 60, inclusive."
                    >
                        <label htmlFor="runtimeInMinutes">
                            Runtime in minutes
                        </label>
                        <input
                            name="runtimeInMinutes"
                            type="number"
                            value={runtimeInMinutes}
                            onChange={handleRuntimeChange}
                            style={{
                                width: "100px",
                                marginBlock: "auto",
                                backgroundColor: fixed ? "#d3d3d3" : "white",
                            }}
                            disabled={fixed}
                        ></input>
                    </div>
                    <div
                        className="flex items-center justify-between space-x-2"
                        title="The weight of the Symmetric Substructer Score in the objective function."
                    >
                        <label htmlFor="s3Weight">S3 weight</label>
                        <input
                            name="s3Weight"
                            type="number"
                            value={s3Weight}
                            onChange={handleChange(setS3Weight)}
                            style={{
                                width: "100px",
                                marginBlock: "auto",
                                backgroundColor: fixed ? "#d3d3d3" : "white",
                            }}
                            disabled={fixed}
                        ></input>
                    </div>
                    <div
                        className="flex items-center justify-between space-x-2"
                        title="The weight of the Edge Coverage in the objective function."
                    >
                        <label htmlFor="ecWeight">EC weight</label>
                        <input
                            name="ecWeight"
                            type="number"
                            value={ecWeight}
                            onChange={handleChange(setEcWeight)}
                            style={{
                                width: "100px",
                                marginBlock: "auto",
                                backgroundColor: fixed ? "#d3d3d3" : "white",
                            }}
                            disabled={fixed}
                        ></input>
                    </div>
                </div>
            </div>
        </div>
    );
};

AlignmentOptions.propTypes = {
    handleOptionChange: PropTypes.func,
    options: PropTypes.shape({
        runtimeInMinutes: PropTypes.number.isRequired,
        s3Weight: PropTypes.number.isRequired,
        ecWeight: PropTypes.number.isRequired
    }).isRequired,
    fixed: PropTypes.bool,
};

export default AlignmentOptions;
