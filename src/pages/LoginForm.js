import React from "react";
import { useState } from "react";
import Button from "../components/Button";


const LoginForm = () => {
    return (
        <div className = "flex h-screen items-center justify-center w-full !max-w-none px-4">
            <div className = "flex w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
                {/*left side -- login form */}
                <div className = "w-full md:w-3/5 p-6">
                    <h2 className = "text-3xl font-semibold text-center text-blue-600">Login</h2>

                    <form className = "mt-6">
                        <div>
                            <label className="block text-gray-700">Email or Username</label>
                            <input type="text" className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter email or username"/>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700">Password</label>
                            <input type="password" className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter password"/>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <label className="flex items-center">
                                <input type="checkbox" className="form-checkbox" />
                                <span className="ml-2 text-gray-600 text-sm">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                        </div>

                        <Button>Sign In</Button>

                    </form>

                    <p className="mt-4 text-center text-gray-600 text-sm">Not a member? <a href="#" className="text-blue-500 hover:underline">Register</a></p>

                </div>

                {/*right side -- sana gif */}
                <div className = "w-full md:w-2/5 flex items-center justify-center">
                    <div>
                        <h3 className ="text-3xl font-semibold text-center">Simulated Annealing Network Aligner</h3>
                        <img src = "network-alignment.gif" alt = "SANA animation" className = "w-64 md:w-80"/>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginForm;