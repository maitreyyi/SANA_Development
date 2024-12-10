import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaEnvelope } from "react-icons/fa"; // Import GitHub and Email icons

function Footer() {
    // Get today's date in a readable format
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <footer className="bg-primary text-white p-6">
            <div className="container mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {/* SANA Software Section */}
                    <div>
                        <h4 className="font-bold text-lg">SANA Software</h4>
                        <div className="flex items-center py-2 space-x-2">
                            {/* Email Icon */}
                            <Link
                                to="mailto:whayes@uci.edu"
                                className="hover:text-hover-link transition"
                                aria-label="Email Wayne B. Hayes"
                            >
                                <FaEnvelope size={24} />
                            </Link>
                            <p>Wayne B. Hayes at U.C. Irvine</p>
                        </div>
                        {/* GitHub Link with Logo and Text */}
                        <div className="flex items-center py-2 space-x-2">
                            <Link
                                to="https://github.com/waynebhayes/SANA"
                                className="inline-flex items-center hover:text-hover-link transition"
                                aria-label="GitHub Repository"
                            >
                                <FaGithub size={24} />
                                <span className="ml-2">SANA</span>
                            </Link>
                        </div>
                    </div>

                    {/* Last Updated Section */}
                    <div className="text-sm">
                        <p className="py-2">
                            Last update:{" "}
                            <span className="font-semibold">
                                {formattedDate}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-400 mt-6 pt-4 text-center">
                    <p className="text-sm">
                        &copy; {currentDate.getFullYear()} SANA
                    </p>
                </div>
            </div>
            <hr className="border-t border-gray-300 my-4"></hr>
        </footer>
    );
}

export default Footer;
