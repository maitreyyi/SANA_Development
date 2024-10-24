// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to the SANA Web Interface</h1>
      <div className="space-y-4">
        <Link to="/submit-job">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700">
            Submit New Job
          </button>
        </Link>
        <Link to="/lookup-job">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700">
            Look up Previous Job
          </button>
        </Link>
        <Link to="/contact-us">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700">
            Contact Us
          </button>
        </Link>
        <Link to="/about-us">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700">
            About Us
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
