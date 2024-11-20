import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SubmitJob from "./pages/SubmitJob";
import LookupJob from "./pages/LookupJob";
import Contact from "./pages/Contact";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center *:w-full">
      <Header />
        <main className="w-full max-w-[900px] flex-1 flex flex-col *:flex-1 *:flex ">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit-job" element={<SubmitJob />} />
            <Route path="/lookup-job" element={<LookupJob />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      <Footer />
      </div>
    </Router>
  );
}

export default App;
