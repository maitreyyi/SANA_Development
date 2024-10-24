import React from 'react';
import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div>
      <h1>SANA Main Page</h1>
      <Link to="/submit-job">Submit New Job</Link>
      <Link to="/lookup-job">Look up Previous Job</Link>
      <Link to="/contact-us">Contact Us</Link>
      <Link to="/about-us">About Us</Link>
    </div>
  );
};

export default MainPage;
