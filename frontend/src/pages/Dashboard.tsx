// import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/authContext";
import { API_URL } from "../api/api";
import { useEffect, useState } from "react";
import { UserRecord } from "../../../backend/types/types";
import { supabase } from "../lib/supabase";
import LoadingSpinner from "../components/Loader";

function Dashboard() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [displayKey, setDisplayKey] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { logout, authFetch, user } = useAuth();
  const [profile, setProfile] = useState<UserRecord | null>(user);

  useEffect(() => {
    async function getUserInfo() {
      const { data: { user }, } = await supabase.auth.getUser();
      const userName = user?.user_metadata?.name.split(" ");
      const firstName = userName[0];
      const lastName = userName[1];
      setProfile((prevUser) => ({
        id: user?.id || prevUser?.id || '',
        first_name: firstName || prevUser?.first_name || '',
        last_name: lastName || prevUser?.last_name || '',
        email: user?.email || prevUser?.email || '',
        api_key: prevUser?.api_key || '',
        created_at: prevUser?.created_at || new Date().toISOString()
      }));
    }
    getUserInfo();
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyFeedback('Failed to copy');
    }
  };

  const handleShowApiKey = async () => {
    setDisplayKey(!displayKey);
    if (apiKey) return;
    try {
      setIsLoading(true);
      const response = await authFetch(`${API_URL}/api/auth/api-key`);
      if (!response.ok) {
        throw new Error('Failed to fetch API key');
      }
      const data = await response.json();
      setApiKey(data.data.api_key);
    } catch (error) {
      console.error('Error fetching API key:', error);
      alert('Failed to fetch API key: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authFetch(`${API_URL}/api/auth/profile`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (!user) {
      fetchProfile();
    }
  }, [authFetch, user]);

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

  // const displayUser = user || profile;
  const displayUser = profile || user;

  if (!displayUser?.first_name || !displayUser?.last_name)
    return <>
      <LoadingSpinner />
    </>;

  return (
    <div className="flex flex-col items-center p-6 w-full">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl flex justify-between">
        
        {/* Left Side - User Info and Job History */}
        <div className="w-2/3">
        <h2 className="text-3xl font-semibold text-blue-700">
            Welcome back, {displayUser?.first_name} {displayUser?.last_name}!
          </h2>
          <p className="text-gray-600">Email: {displayUser?.email}</p>
          {/* <p className="text-gray-600">Role: {displayUser?.role}</p> */}
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
          {/* <div className="bg-yellow-200 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Need to process more than {user.limit} files?</h3>
            <p className="text-sm text-gray-700">Request an API key!</p>
            <button 
              className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg w-full transition duration-300"
              onClick={() => navigate("/request-apiskey")}
            >
              Request API Key
            </button>
          </div> */}
            <div className="bg-yellow-200 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Your API Key</h3>
              {apiKey && displayKey ? (
                <>
                <div className="relative bg-gray-100 p-2 rounded break-all text-sm font-mono">
                  <div className="p-5"> 
                    {apiKey}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(apiKey)}
                    className="absolute top-1 right-1 bg-blue-500 hover:bg-blue-600 text-white px-1 py-1 rounded text-[0.60rem] min-w-[30px]"
                  >
                    {copyFeedback || 'Copy'}
                  </button>
                </div>
                <button 
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg w-full transition duration-300 cursor-pointer"
                    onClick={handleShowApiKey}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Hide API Key'}
                  </button>
                </>
              ) : (
                <button 
                  className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg w-full transition duration-300 cursor-pointer"
                  onClick={handleShowApiKey}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Show API Key'}
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6 text-center">
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-300"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;