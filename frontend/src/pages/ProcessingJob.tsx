import { useParams } from "react-router";
import Output from "../components/Output";
import Fallback from "./Fallback";

const ProcessingJob = () => {
    const { id } = useParams();

    if (!id) {
        return <Fallback />;
    }

    return <Output jobId={id} isFinished={false} />;
};

export default ProcessingJob;
