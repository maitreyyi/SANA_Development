import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RegisterForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Handle Google Register Redirect
    const handleGoogleRegister = () => {
        window.location.href = "http://localhost:4000/api/auth/google"; // Redirect to backend OAuth
    };

    // Handle Form Submission
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("http://localhost:4000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("apiKey", data.apiKey);
                navigate("/dashboard"); // Redirect to dashboard
            } else {
                setError(data.message || "Registration failed.");
            }
        } catch (error) {
            //onsole.error("Registration error:", error);
            setError((error as Error).message);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex h-screen items-center justify-center w-full px-4">
            <div className="flex flex-col w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden p-8">
                
                {/* Register Heading */}
                <div className="w-full flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold text-blue-700">Register</h2>
                </div>

                {/* Register with Google */}
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

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* Form Fields */}
                <form onSubmit={handleRegister} className="w-full">
                    <div className="w-full">
                        <label className="text-sm font-medium text-gray-700">First name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Last name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="w-full mt-3">
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

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="w-full mt-6">
                        <Button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-lg shadow-md transition duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Registering..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;