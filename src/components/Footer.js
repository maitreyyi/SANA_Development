import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-primary text-base text-white p-4 text-left">
      <h4 className="font-bold text-lg">SANA software</h4>
      <p className="py-2">
        Written by Nil Mamano under the supervision of{" "}
        <Link
          href="mailto:whayes@uci.edu"
          className="underline hover:text-hover-link transition"
        >
          Wayne B. Hayes
        </Link>{" "}
        at U.C. Irvine.
      </p>
      <Link
        href="https://github.com/waynebhayes/SANA"
        className="underline hover:text-hover-link transition"
      >
        SANA software GitHub
      </Link>

      <hr className="border-t border-gray-300 my-4"></hr>

      <h4 className="font-bold text-lg">SANA Web Interface</h4>
      <p className="py-2">Current Developer: Maitreyi Sinha</p>
      <Link href="TODO" className="underline hover:text-hover-link transition">
        SANA Web Interface GitHub (TO BE ADDED)
      </Link>

      <hr className="border-t border-gray-300 my-4"></hr>

      <h4 className="font-bold text-lg">Questions and Contact</h4>
      <p className="py-2">
        Contact the current developer above and/or Dr. Wayne B. Hayes for
        questions, comments, or bugs.
      </p>
      <p className="py-2 text-xs">Last update November 13, 2024</p>
    </footer>
  );
}

export default Footer;
