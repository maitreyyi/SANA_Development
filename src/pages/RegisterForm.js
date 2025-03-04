import React from "react";
import Button from "../components/Button";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const handleGoogleRegister = () => {

};

const RegisterForm = () => {
    return (
        <div className="flex h-screen items-center justify-center w-full px-4">
            <div className="flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden p-8">
                
                {/* Register Heading */}
                <div className="w-full flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold text-blue-700">Register</h2>
                </div>

                {/* Sign In with Google */}
                <div className="w-full mt-6">
                    <Button 
                        onClick={handleGoogleRegister} 
                        className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-lg py-3 rounded-lg shadow-md transition duration-300">
                        <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 mr-3" />
                        Register with Google
                    </Button>
                </div>

                {/* OR Divider */}
                <div className="flex items-center justify-center w-full my-4">
                    <hr className="w-1/3 border-gray-300"/> 
                    <span className="text-gray-400 mx-2 text-sm">OR</span>
                    <hr className="w-1/3 border-gray-300"/>
                </div>
                {/*First + Last Name fields*/}
                <div className="w-full">
                    <label className="text-sm font-medium text-gray-700">First name</label>
                    <input type="email" className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your first name"/>
                </div>

                <div className="w-full">
                    <label className="text-sm font-medium text-gray-700">Last name</label>
                    <input type="email" className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your last name"/>
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

                <div className="w-full mt-3">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Re-enter your password"/>
                </div>


                {/* Submit Button */}
                <div className="w-full mt-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg shadow-md transition duration-300">
                        Submit
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default RegisterForm;