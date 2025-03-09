import { useEffect } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/authContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LoadingSpinner from "../components/Loader";

const loginSchema = z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


const LoginForm = () => {
    const navigate = useNavigate();
    const { login, user, isLoading, loginWithGoogle } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
          email: "",
          password: "",
        },
      });

    useEffect(() => {
        if (user) {
            navigate("/dashboard"); 
        }
    }, [user, navigate]);



    const onSubmit = async (data: LoginFormValues) => {
        try {
          await login(data.email, data.password);
        } catch (error) {
          alert("Login failed: " + (error as Error).message);
        }
      };
    

    if (isLoading) {
        return <LoadingSpinner message="Signing you in..." />;
    }

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
                        onClick={loginWithGoogle} 
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
                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                    <div>
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
                        <p className="mt-1 text-sm text-red-600">
                            {errors.password.message}
                        </p>
                        )}
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