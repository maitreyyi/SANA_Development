// src/components/Home.js
import React from 'react';
// import { Link } from 'react-router-dom';
import JobLookUpForm from '../components/JobLookUpForm';

const Home = () => {
  return (
        <div className='mx-auto w-full flex items-center justify-center p-4'>
          <JobLookUpForm/>
        </div> 
    );
};

export default Home;
