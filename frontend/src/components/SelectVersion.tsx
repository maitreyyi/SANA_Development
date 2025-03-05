import { SanaVersion } from '../context/JobSubmissionContext';


interface SelectVersionProps {
    sanaVersion: SanaVersion;
    handleVersionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectVersion = ({ sanaVersion, handleVersionChange }: SelectVersionProps) => (
    <div className="bg-gray-200 p-4 mt-4">
        <div>
            <h3 className='text-3xl'>Choose which version of SANA you would like to run</h3>
            <div className='mt-2'>
                The default version of SANA that you can use is SANA 2.0
            </div>
        </div>
        <div className="mt-4">
            <select
                id="sanaVersion"
                value={sanaVersion}
                onChange={handleVersionChange}
                className="p-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
                <option value="SANA2">SANA 2.0</option>
                <option value="SANA1_1">SANA 1.1</option>
                <option value="SANA1">SANA 1.0</option>
            </select>
        </div>
    </div>
);

export default SelectVersion;
