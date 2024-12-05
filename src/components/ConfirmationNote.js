import AlignmentOptions from "./AlignmentOptions";
import PropTypes from 'prop-types';

const ConfirmationNote = ({ handleOptionChange, options } ) => {
    return (
      <div>
        <div
            className="bg-yellow-100 border-l-4 border-r-4 border-yellow-500 p-4 rounded-lg shadow-sm my-4"
        >
            <h2 className="text-lg font-bold text-yellow-800 mb-2">NOTE</h2>
            <p>Please note the following:</p>
            <ul className="list-disc pl-8">
                <li>
                    The networks will be aligned with the following options,
                    which cannot be changed after submission. To proceed, click
                    the submit button.
                </li>
                <li>
                    Faded values are default settings. To make changes, click
                    the back button.
                </li>
            </ul>
        </div>
          <AlignmentOptions handleOptionChange={handleOptionChange} options={options} fixed/>
        </div>
    );
};


ConfirmationNote.propTypes = {
  handleOptionChange: PropTypes.func,
  options: PropTypes.shape({
      runtimeInMinutes: PropTypes.number.isRequired,
      s3Weight: PropTypes.number.isRequired,
      ecWeight: PropTypes.number.isRequired,
  }).isRequired
};

export default ConfirmationNote;
