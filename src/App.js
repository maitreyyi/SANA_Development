import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SubmitJob from "./pages/SubmitJob";
import ProcessingJob from './pages/ProcessingJob';
import LookupJob from "./pages/LookupJob";
import Contact from "./pages/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Results from "./pages/Results";
import LoginForm from "./pages/LoginForm";
import { JobSubmissionProvider } from "./context/JobSubmissionContext";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center *:w-full">
      <Header />
        <main className="w-full max-w-5xl flex-1 flex flex-col *:flex-1 *:flex *:flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/login" element={<LoginForm />} />
            <Route path="/submit-job" element={
              <JobSubmissionProvider>
                <SubmitJob/>
              </JobSubmissionProvider>
              } 
            />
            <Route path="/submit-job/:id" element={<ProcessingJob />} />
            <Route path="/lookup-job" element={<LookupJob />} />
            <Route path="/lookup-job/:id" element={<Results />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      <Footer />
      </div>
    </Router>
  );
}

export default App;
// added *:flex-col to main, potentially breaking