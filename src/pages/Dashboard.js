import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  /** 
  useEffect(() => {
    //const token = localStorage.getItem("token");
    //if (!token) {
    //  navigate("/"); // Redirect to login if not authenticated
    //  return;
    //}

    //Fetch user data
    fetch("http://localhost:5000/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user:", err));
  }, [navigate]);

  if (!user) return <h2 className="text-center text-gray-700">Loading...</h2>;
   **/
  return (
    <div className="flex flex-col items-center p-6 w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl flex justify-between">
        
        {/* Left Side - User Info and Job History */}
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-blue-700">
            Welcome back, {/**user.name**/}!
          </h2>
          <p className="text-gray-600">Tier: {/**user.tier**/}</p>

          {/* Job History */}
          <div className="mt-6">
            <h3 className="text-xl font-medium text-gray-800">History:</h3>
            {/**user.history.length > 0 ? (
              <ul className="mt-2 space-y-4">
                {user.history.map((job, index) => (
                  <li key={index} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                    <p className="font-semibold">Job ID: {job.id} - {job.title}</p>
                    <p className="text-sm text-gray-600">Submitted: {job.submitDate}</p>
                    <p className="text-sm text-gray-600">Completed: {job.completionDate}</p>
                    <p className={`text-sm font-bold ${job.status === "Completed" ? "text-green-600" : "text-red-600"}`}>
                      Status: {job.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No job history available.</p>
            )**/}
          </div>
        </div>

        {/* Right Side - Submit Job & API Key */}
        <div className="w-1/3 flex flex-col space-y-4">
          {/* Submit Another Job Button */}
          <div className="bg-green-200 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Submit another Job?</h3>
            <p className="text-sm text-gray-700">Note: zip file required</p>
            <button 
              className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg w-full transition duration-300"
              onClick={() => navigate("/submit-zip")}
            >
              Submit Job
            </button>
          </div>

          {/* API Key Request */}
          <div className="bg-yellow-200 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Need to process more than {/**user.limit**/} files?</h3>
            <p className="text-sm text-gray-700">Request an API key!</p>
            <button 
              className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg w-full transition duration-300"
              onClick={() => navigate("/request-apiskey")}
            >
              Request API Key
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-300"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;