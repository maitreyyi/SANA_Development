// src/components/Home.js
import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to the SANA Web Interface
      </h1>
      <div className="space-y-4">
        <Link to="/submit-job">
          <Button>Submit New Job</Button>
        </Link>
        <Link to="/lookup-job">
          <Button>Look up Previous Job</Button>
        </Link>
        <Link to="/contact-us">
          <Button>Contact Us</Button>
        </Link>
        <Link to="/about-us">
          <Button>About Us</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
