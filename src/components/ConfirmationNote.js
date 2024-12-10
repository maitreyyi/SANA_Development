import AlignmentOptions from "./AlignmentOptions";
import PropTypes from "prop-types";
import Note from "./Note";

const ConfirmationNote = ({ handleOptionChange, options }) => {
    return (
        <div>
            <Note>
                <p>Please note the following:</p>
                <ul className="list-disc pl-8">
                    <li>
                        The networks will be aligned with the following options,
                        which cannot be changed after submission. To proceed,
                        click the submit button.
                    </li>
                    <li>
                        Faded values are default settings. To make changes,
                        click the back button.
                    </li>
                </ul>
            </Note>
            <AlignmentOptions
                handleOptionChange={handleOptionChange}
                options={options}
                fixed
            />
        </div>
    );
};

ConfirmationNote.propTypes = {
    handleOptionChange: PropTypes.func,
    options: PropTypes.shape({
        runtimeInMinutes: PropTypes.number.isRequired,
        s3Weight: PropTypes.number.isRequired,
        ecWeight: PropTypes.number.isRequired,
    }).isRequired,
};

export default ConfirmationNote;
