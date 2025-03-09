import Button from "../components/Button";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { API_URL } from '../api/api';
import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";

const registerSchema = z.object({
    first_name: z.string()
        .min(1, { message: "First name is required" })
        .max(50, { message: "First name must be less than 50 characters" }),
    last_name: z.string()
        .min(1, { message: "Last name is required" })
        .max(50, { message: "Last name must be less than 50 characters" }),
    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email address" }),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
        .min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string>("");
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });


    const onSubmit = async (data: RegisterFormValues) => {
        setIsSubmitting(true);
        setServerError("");

        try {
            const { isConfirmed, email } = await signup(data);
            if (!isConfirmed) {
                // User needs to verify email
                navigate('/verification-pending', { 
                    state: { email } 
                });
            }
        } catch (error) {
            setServerError((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
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
                        onClick={loginWithGoogle} 
                        className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-lg py-3 rounded-lg shadow-md transition duration-300"
                    >
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

                {/* Server Error Message */}
                {serverError && (
                    <p className="text-red-500 text-sm text-center mb-4">{serverError}</p>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                    <div className="w-full">
                        <label className="text-sm font-medium text-gray-700">First name</label>
                        <input 
                            type="text"
                            className={`w-full px-4 py-2 mt-2 border ${
                                errors.first_name
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            } rounded-lg focus:outline-none focus:ring-2`}
                            placeholder="Enter your first name"
                            {...register("first_name")}
                        />
                        {errors.first_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                        )}
                    </div>

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Last name</label>
                        <input 
                            type="text"
                            className={`w-full px-4 py-2 mt-2 border ${
                                errors.last_name
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            } rounded-lg focus:outline-none focus:ring-2`}
                            placeholder="Enter your last name"
                            {...register("last_name")}
                        />
                        {errors.last_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                        )}
                    </div>

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email"
                            className={`w-full px-4 py-2 mt-2 border ${
                                errors.email
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            } rounded-lg focus:outline-none focus:ring-2`}
                            placeholder="Enter your email"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password"
                            className={`w-full px-4 py-2 mt-2 border ${
                                errors.password
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            } rounded-lg focus:outline-none focus:ring-2`}
                            placeholder="Enter your password"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="w-full mt-3">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input 
                            type="password"
                            className={`w-full px-4 py-2 mt-2 border ${
                                errors.confirmPassword
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                            } rounded-lg focus:outline-none focus:ring-2`}
                            placeholder="Re-enter your password"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
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

                    {/* Sign In Link */}
                    <p className="mt-4 text-center text-gray-600 text-sm">
                        Already have an account? <a href="/login" className="text-blue-500 hover:underline">Sign in</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;