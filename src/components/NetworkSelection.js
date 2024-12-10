import Note from "./Note";

const NetworkSelection = ({ handleFileInputChange, sanaVersion }) => {


    return (
        <div className="content select-networks active visited">
            <div id="network-selection-prompt" className="mt-4">
                <p className="text-gray-800">
                    Please select two networks to align. Allowed file types are:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                    <li>
                        <strong>LEDA</strong> →{" "}
                        <code className="text-blue-600">.gw</code>
                    </li>
                    <li>
                        <strong>ELISP</strong> →{" "}
                        <code className="text-blue-600">.el</code>
                    </li>
                </ul>
            </div>
            <Note>
                <p className="text-gray-800 block mb-2">
                    Please note the following:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-700">
                    {sanaVersion === "SANA1" && (
                        <>
                            <li>The networks must be of the same file type.</li>
                            <li>
                                If you would like to align a network against
                                itself, select the same file twice.
                            </li>
                            <li>
                                The first network must be smaller than or equal
                                to the second network in terms of the number of
                                nodes.
                            </li>
                            <li>Files must be less than or equal to 1MB.</li>
                            <li>
                                You can specify how much time SANA runs (up to
                                20 minutes).
                            </li>
                        </>
                    )}
                    {(sanaVersion === "SANA1_1" || sanaVersion === "SANA2") && (
                        <>
                            <li>The networks must be of the same file type.</li>
                            <li>
                                If you would like to align a network against
                                itself, select the same file twice.
                            </li>
                            <li>
                                The first network must be smaller than or equal
                                to the second network in terms of the number of
                                nodes it contains (which can be found by looking
                                at the 5th line of a given LEDA file).
                            </li>
                            <li>
                                For the sake of conserving server space, network
                                files must be less than or equal to 1MB in size.
                            </li>
                            <li>
                                You can specify how much time SANA runs (up to
                                20 minutes, plus preprocessing time which adds
                                about 10-20%).
                            </li>
                        </>
                    )}
                </ul>
            </Note>
            <div id="network-file-input-wrapper" className="mt-6 space-y-6">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-4 md:mb-0">
                        <span className="text-gray-800">
                            If you aren't aligning a network to itself, select
                            the{" "}
                            <strong>
                                <em>smaller</em>
                            </strong>{" "}
                            network (in terms of node count).
                        </span>
                    </div>
                    <div className="md:w-1/2">
                        <input
                            type="file"
                            id="network-file-1-input"
                            className="file-input border rounded-md shadow-sm p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            name="network-files[]"
                            onChange={(e) =>
                                handleFileInputChange(e, "network-file1")
                            }
                        ></input>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-4 md:mb-0">
                        <span className="text-gray-800">
                            If you aren't aligning a network to itself, select
                            the{" "}
                            <strong>
                                <em>larger</em>
                            </strong>{" "}
                            network (in terms of node count).
                        </span>
                    </div>
                    <div className="md:w-1/2">
                        <input
                            type="file"
                            id="network-file-2-input"
                            className="file-input border rounded-md shadow-sm p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            name="network-files[]"
                            onChange={(e) =>
                                handleFileInputChange(e, "network-file2")
                            }
                        ></input>
                    </div>
                </div>
                {sanaVersion === "SANA2" && (
                    <>
                        <Note title={"OPTIONAL"}>
                            <p className="text-gray-800">
                                External Similarity File Count
                            </p>
                            <ul className="list-disc list-inside ml-4 text-gray-700">
                                <li>
                                    All similarity files must follow the
                                    3-column format: protein from species 1,
                                    protein from species 2, similarity.
                                </li>
                                <li>
                                    External Similarity weight: weight
                                    specifying objective function weights for
                                    external similarity files. Default will be
                                    zero.
                                </li>
                            </ul>
                            <div className="mt-4">
                            <select
                                id="similarity-files"
                                // value={sanaVersion}
                                // onChange={handleVersionChange}
                                className="p-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>
                        </Note>

                    </>
                )}
            </div>
        </div>
    );
};

export default NetworkSelection;
