import AlignmentOptions from "./AlignmentOptions";
import Note from './Note';

const ConfirmationNote = () => {
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
                fixed
            />
        </div>
    );
};

export default ConfirmationNote;
