import { useState } from "react";
import { useNavigate } from "react-router-dom";

const APIRequestForm = () => {
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/request-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, description }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Your API key request has been submitted successfully!");
        navigate("/dashboard");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("An error occurred. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-gray-200 w-full max-w-3xl shadow-lg rounded-lg p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold border-b pb-2">Request an API Key</h2>

        {/* Content */}
        <div className="mt-4">
          <h3 className="text-xl font-bold">Request an API Key</h3>
          <p className="text-gray-700 mt-2">
            API keys are issued by Hayes Lab. To request a key, please describe how you will utilize it.
            Once our support team has reviewed the request (generally within 2 business days), 
            you will receive a confirmation via email.
          </p>

          {/* Form */}
          <form className="mt-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full px-4 py-2 mt-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Description Field */}
            <textarea
              placeholder="Please describe what you intend to do with the key..."
              className="w-full h-24 px-4 py-2 mt-4 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>

            {/* Buttons */}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default APIRequestForm;