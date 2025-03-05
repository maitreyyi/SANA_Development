// send this to the backend
// $(document).ready(function()
// {
// 	$.ajax({
// 		url: "/process/process.php", /job/process
// 		type: "POST",
// 		data: {id: queryID},
// 		async: true,
// 		cache: false
//     	}).done(function(data, status, something){
// 		data = JSON.parse(data);
// 		if (data["status"] == "Image successfully processed.")
// 			window.location = data["data"]['url'];
// 	}).fail(function(x, y, z){
// 	});
// });

// expectiong data.status = 'Networks successfully processed.'
// window.location = data.redirect

// useeffect . []
import { useParams } from "react-router";
import Output from "../components/Output";
import Fallback from "./Fallback";

const Results = () => {
    const { id } = useParams();

    if (!id) {
        return <Fallback isResults />;
    }

    return <Output jobId={id} isFinished={true} />;
};

export default Results;
