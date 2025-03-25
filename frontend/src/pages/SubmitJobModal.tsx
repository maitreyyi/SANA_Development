import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import { useAuth } from "../context/authContext";

interface SubmitJobModalProps {
  onClose: () => void;
  onUpload: () => void;
}


const SubmitJobModal = ({ onClose, onUpload }: SubmitJobModalProps) => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setZipFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      setZipFile(event.dataTransfer.files[0]);
    }
  };

  // const handleUpload = async () => {
  //   if (!file) {
  //     alert("Please select a file to upload.");
  //     return;
  //   }

  //   setIsUploading(true);
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const response = await fetch("http://localhost:5000/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const data = await response.json();
  //     if (data.success) {
  //       alert("File uploaded successfully!");
  //       onUpload();
  //       onClose();
  //     } else {
  //       alert("Upload failed: " + data.message);
  //     }
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     alert("An error occurred. Please try again.");
  //   }

  //   setIsUploading(false);
  // };
// Example usage in a React component
const handleZipUpload = async () => {
  if (!zipFile) {
    alert("Please select a zip file to upload.");
    return;
  }

  setIsUploading(true);
  const formData = new FormData();
  formData.append("zipFile", zipFile);

  try {
    const response = await authFetch(`/api/jobs/submit-default-zip`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.status === "success") {
      alert("Job submitted successfully!");
      onUpload();
      onClose(); 
      // Handle success case
    } else if (data.status === "redirect") {
      onClose();
      const redirectPath = data.redirect.startsWith('http') 
      ? new URL(data.redirect).pathname 
      : data.redirect;
      navigate(redirectPath);
    } else {
      alert("Upload failed: " + data.message);
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("An error occurred. Please try again.");
  }

  setIsUploading(false);
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        
        {/* Title */}
        <h2 className="text-2xl font-bold">Submit Job</h2>

        {/* Execution Parameters Info */}
        <div className="bg-blue-100 p-3 rounded-md mt-3 border border-blue-400">
          <p className="text-sm text-blue-900">
            <strong>ℹ The submission will run with the default execution parameters:</strong> 
            SANA 2.0
            (s3 = 0, ec = 1, ics = 0, tolerance = 0.1).
          </p>
        </div>

        {/* File Upload Box */}
        <div 
          className="border-2 border-dashed border-gray-400 rounded-md p-6 mt-4 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-blue-500 text-4xl" />
            <p className="text-gray-700 mt-2">Drop files here</p>
            <p className="text-gray-500 text-sm">OR</p>
            <label className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-md cursor-pointer">
              Browse
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          {zipFile && <p className="text-green-600 mt-2">Selected: {zipFile.name}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          <button 
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md cursor-pointer"
            onClick={() => navigate("/dashboard")}
            // onClick={handleZipUpload}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer"
            onClick={handleZipUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubmitJobModal;