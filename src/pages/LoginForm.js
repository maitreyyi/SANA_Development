import React from "react";
import { signIn } from "next-auth/react"; // Use if you're using NextAuth.js
import Button from "../components/Button";

const LoginForm = () => {
    return (
        <div className="flex h-screen items-center justify-center w-full !max-w-none px-4">
            <div className="flex w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
                
                {/* Left Side - OAuth Login */}
                <div className="w-full md:w-3/5 p-6">
                    <h2 className="text-3xl font-semibold text-center text-blue-600">Login</h2>

                    <div className="mt-6 space-y-4">
                        <Button onClick={() => signIn("google")} className="w-full bg-red-500 hover:bg-red-600 text-white">
                            Sign in with Google
                        </Button>

                        <Button onClick={() => signIn("github")} className="w-full bg-gray-800 hover:bg-gray-900 text-white">
                            Sign in with GitHub
                        </Button>

                        <Button onClick={() => signIn("facebook")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Sign in with Facebook
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-gray-600 text-sm">
                        By signing in, you agree to our <a href="#" className="text-blue-500 hover:underline">Terms & Conditions</a>
                    </p>
                </div>

                {/* Right Side - SANA Animation */}
                <div className="w-full md:w-2/5 flex items-center justify-center">
                    <div>
                        <h3 className="text-3xl font-semibold text-center">Simulated Annealing Network Aligner</h3>
                        <img src="network-alignment.gif" alt="SANA animation" className="w-64 md:w-80"/>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginForm;