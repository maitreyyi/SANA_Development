import { useState } from "react";
import Button from './Button';
import AlignmentOptions from "./AlignmentOptions";
import Note from "./Note";
import { useJobSubmission } from "../context/JobSubmissionContext";

const OptionVersion = () => {
    const { sanaVersion } = useJobSubmission();
    if (sanaVersion !== 'SANA2') {
        return (
            <div className="w-full">
                <hr />
                <h2 className="text-2xl text-yellow-800">
                    Standard Network Alignment Options
                </h2>
                {/* <div className="grid grid-cols-1 md:grid-cols-[25%,75%] gap-8"> */}
                <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8">
                    <p className="text-lg">Runtime in minutes</p>
                    <p>
                        The weight of the Symmetric Substructer Score in the
                        objective function.
                    </p>
                    <p className="text-lg">S3 weight</p>
                    <p>
                        The weight of the Symmetric Substructer Score in the
                        objective function.
                    </p>
                    <p className="text-lg">EC weight</p>
                    <p>
                        The weight of the Edge Coverage in the objective
                        function.
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <>
                <div className="w-full">
                    <hr />
                    <h2 className="text-2xl text-yellow-800">
                        Standard Network Alignment Options
                    </h2>
                    {/* <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8"> */}
                    <div className="grid grid-cols-1 md:grid-cols-[25%,75%] gap-8">
                        <p className="text-lg">S3 weight</p>
                        <p>
                            The weight of the Symmetric Substructer Score in the
                            objective function.
                        </p>
                        <p className="text-lg">EC weight</p>
                        <p>
                            The weight of the Edge Coverage in the objective
                            function.
                        </p>
                        <p className="text-lg">Weight of ICS</p>
                        <p>
                            The weight of the Induced Conserved Structure in the
                            objective function.
                        </p>
                        <p className="text-lg">
                            Target tolerance for optimal objective
                        </p>
                        <p>
                            Attempt to optimize the final value of the objective
                            to within this tolerance of the optimal solution.
                            Each increase in value in menu will make the runtime
                            approximately 5-10 times longer.
                        </p>
                    </div>
                </div>
                <div className="w-full">
                    <hr />
                    <h2 className="text-2xl text-yellow-800">
                        Advanced Options
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-[25%,75%] gap-8">
                        <p className="text-lg">External Similarity Weights</p>
                        <p>
                            An integer followed by that many weights, specifying
                            objective function weights for external similarity
                            files (must be the same integer as given to -simFile
                            and -simFormat).
                        </p>
                        <p className="text-lg">External Similarity Filenames</p>
                        <p>
                            An integer (same integer as given to -esim and
                            -simFormat) followed by that many filesnames,
                            specifying external three-column (node from G1, node
                            from G2, similarity) similarities. The similarities
                            in the 3rd column will be normalized to be in [0,1].
                            These simFiles will be given weight according to the
                            -esim argument.
                        </p>
                    </div>
                </div>
            </>
        );
    }
};

const OptionsHelp = () => {
    const [optionsShow, setOptionsShow] = useState(false);

    return (
        <div className="w-full mx-auto">
            <Note>
                {/* <h2 className="text-3xl w-full">Options Help</h2> */}
                <p className="w-full">
                    Hover over an option to see its description or click the
                    button to view the entire help menu.
                </p>
                {/* <span className="w-full">Hover over an option to see its description or click the button to view the entire help menu.</span> */}
                <div className="w-full">
                    <Button
                        className="button radius"
                        onClick={() => setOptionsShow(!optionsShow)}
                    >
                        {optionsShow ? "- " : "+ "}
                        <span>Show Options Help Menu</span>
                    </Button>
                    {optionsShow && <OptionVersion />}
                </div>
            </Note>
            <AlignmentOptions />
        </div>
    );
};

export default OptionsHelp;
