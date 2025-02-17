import React from "react";
import Button from "../components/Button";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google"; // Redirect to backend OAuth
};

const handleLogout = () => {
    window.location.href = "http://localhost:5000/auth/logout"; // Logs out user
};

const LoginForm = () => {
    return (
        <div className="flex h-screen items-center justify-center w-full px-4">
            <div className="flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden p-8">
                
                {/* Login Heading */}
                <div className="w-full flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold text-blue-700">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
                </div>

                {/* Sign In with Google */}
                <div className="w-full mt-6">
                    <Button 
                        onClick={handleGoogleLogin} 
                        className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-lg py-3 rounded-lg shadow-md transition duration-300">
                        <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 mr-3" />
                        Sign in with Google
                    </Button>
                </div>

                {/* OR Divider */}
                <div className="flex items-center justify-center w-full my-4">
                    <hr className="w-1/3 border-gray-300"/> 
                    <span className="text-gray-400 mx-2 text-sm">OR</span>
                    <hr className="w-1/3 border-gray-300"/>
                </div>

                {/* Email & Password Fields */}
                <div className="w-full">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input type="email" className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your email"/>
                </div>

                <div className="w-full mt-3">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input type="password" className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your password"/>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center mt-4">
                    <label className="flex items-center">
                        <input type="checkbox" className="form-checkbox text-blue-600"/>
                        <span className="ml-2 text-gray-600 text-sm">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                </div>

                {/* Login Button */}
                <div className="w-full mt-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg shadow-md transition duration-300">
                        Sign In
                    </Button>
                </div>

                {/* Sign Up Link */}
                <p className="mt-4 text-center text-gray-600 text-sm">
                    Don't have an account? <a href="#" className="text-blue-500 hover:underline">Register</a>
                </p>

                {/* GIF Section */}
                <div className="w-full flex flex-col items-center justify-center mt-8">
                    <h3 className="text-xl font-semibold text-center text-gray-700">Simulated Annealing Network Aligner</h3>
                    <img src="network-alignment.gif" alt="SANA animation" className="w-36 md:w-48 lg:w-56 rounded-lg shadow-lg mt-3"/>
                </div>

            </div>
        </div>
    );
};

export default LoginForm;