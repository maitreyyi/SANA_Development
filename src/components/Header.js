import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="fixed top-0 w-full bg-primary text-white p-4 shadow-xl flex justify-between items-center">
      <Link
        to="/"
        className="text-xl flex items-center gap-2 text-opacity-0 hover:text-hover-link transition"
      >
        <img src="/sana-logo-white.png" alt="sana logo" className="size-10" />
        SANA Web Interface
      </Link>
      <nav className="flex space-x-4">
        <Link to="/submit-job" className="hover:text-hover-link transition">
          Submit Job
        </Link>
        <Link to="/lookup-job" className="hover:text-hover-link transition">
          Lookup Previous Job
        </Link>
        <Link to="/contact" className="hover:text-hover-link transition">
          Contact Us
        </Link>
      </nav>
    </header>
  );
}

export default Header;
