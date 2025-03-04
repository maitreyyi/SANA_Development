import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Handle Google OAuth Redirect
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard"); // Redirect if already logged in
        }
    }, [navigate]);

    // Handle Google Login
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:4000/api/auth/google"; // Redirect to backend OAuth
    };

    // Handle Email/Password Login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem("token", data.token); // Store authentication token
                navigate("/dashboard"); // Redirect to dashboard
            } else {
                alert("Login failed: " + data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

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
                <form onSubmit={handleLogin} className="w-full">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end mt-4">
                        <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                    </div>

                    {/* Login Button */}
                    <div className="w-full mt-6">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg shadow-md transition duration-300">
                            Sign In
                        </Button>
                    </div>
                </form>

                {/* Sign Up Link */}
                <p className="mt-4 text-center text-gray-600 text-sm">
                    Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;