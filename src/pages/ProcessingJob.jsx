import { useParams } from "react-router-dom";
import Output from "../components/Output";
import Fallback from "./Fallback";

const ProcessingJob = () => {
    const { id } = useParams();

    if(!id){
        return <Fallback />;
    }

    return (
        <Output jobId={id} isFinished={false} />
    );
};

export default ProcessingJob;