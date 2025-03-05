import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api/api";
import {
    inputClasses,
    containerClasses,
    buttonClasses,
    labelClasses,
    headingTwoClasses,
} from "../utils/tailwindClasses";

// define zod schema
const contactSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email address" }),
    subject: z.string().optional(),
    message: z.string().min(1, { message: "Message is required" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    /**
     * Submits form data via API
     * @param {ContactFormData} data - Form data validated by Zod
     */
    const onSubmit = async (data: ContactFormData) => {
        try {
            await api.contactUs(data);
            setSubmitStatus({
                type: "success",
                message: "Thank you! Your message to the team has been sent",
            });
            reset(); // Clear form after successful submission
        } catch (error) {
            setSubmitStatus({
                type: "error",
                message: "An error occurred. Please try again.",
            });
            console.error("Form submission error:", error);
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className={`${containerClasses}`}
                noValidate
            >
                <h2 className={`${headingTwoClasses}`}>Contact Us</h2>

                {submitStatus.type && (
                    <div
                        className={`p-3 rounded-md mb-4 ${
                            submitStatus.type === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {submitStatus.message}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="name" className={`${labelClasses}`}>
                        Name:
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter name"
                        className={`${inputClasses} ${
                            errors.name
                                ? "border-red-500 focus:border-red-500"
                                : ""
                        }`}
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="mt-1 text-red-500 text-sm">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className={`${labelClasses}`}>
                        Email:
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        className={`w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 text-black ${
                            errors.email
                                ? "border-red-500 focus:border-red-500"
                                : ""
                        }`}
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-red-500 text-sm">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="subject" className={`${labelClasses}`}>
                        Subject:
                    </label>
                    <input
                        id="subject"
                        type="text"
                        placeholder="Enter subject"
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 text-black"
                        {...register("subject")}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="message" className={`${labelClasses}`}>
                        Message:
                    </label>
                    <textarea
                        id="message"
                        placeholder="Enter message"
                        className={`w-full h-32 min-h-[8rem] max-h-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 text-black ${
                            errors.message
                                ? "border-red-500 focus:border-red-500"
                                : ""
                        }`}
                        {...register("message")}
                    />
                    {errors.message && (
                        <p className="mt-1 text-red-500 text-sm">
                            {errors.message.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className={`${buttonClasses}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default Contact;
