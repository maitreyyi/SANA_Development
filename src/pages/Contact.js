import api from "../api/api";
import { inputClasses, containerClasses, buttonClasses, labelClasses, headingTwoClasses } from "../utils/tailwindClasses";

/**
 * Validates an email format using a regular expression.
 * @param {string} email - The email to validate.
 * @returns {boolean} - Returns true if the email is valid, otherwise false.
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const Contact = () => {
    /**
     * Submits form data.
     * @param {React.FormEvent} event - The form event.
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        // Name: (Required) A text field for users to enter their name.
        // Email: (Required) validated to ensure a proper email format.
        // Subject: (Optional)
        // Message: (Required) A large text area for users to type their inquiry or comments.
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            subject: formData.get("subject"),
            message: formData.get("message"),
        };
        if (!data.name || !data.email || !data.message) {
            const missingFields = [];
            if (!data.name) missingFields.push("name");
            if (!data.email) missingFields.push("email");
            if (!data.message) missingFields.push("message");

            alert(`Please fill out all the required fields.`);
            alert(
                `Please fill out all required fields:\n${missingFields
                    .map((field) => `- missing ${field}`)
                    .join("\n")}`
            );
            return;
        }
        if (!validateEmail(data.email)) {
            alert("Please enter a valid email address.");
            return;
        }
        try {
            await api.contactUs(data);
            // console.log("contact response:", response); //TESTING
            alert("Thank you! Your message to the team has been sent");
        } catch (error) {
            alert("An error occured. Please try again.");
            console.error("Form submission error:", error);
        }
    };
    return (
        <div >
            <form
                onSubmit={handleSubmit}
                className={`${containerClasses}`}            >
                <h2 
                    className={`${headingTwoClasses}`}
                >Contact Us</h2>
                <div>
                    <label htmlFor="name" className={`${labelClasses}`}>
                        {" "}
                        Name:
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Enter name"
                        className={`${inputClasses}`}
                    />
                </div>
                <div>
                    <label className={`${labelClasses}`}>Email:</label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="Enter email"
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 text-black"
                    />
                </div>
                <div>
                    <label className={`${labelClasses}`}> Subject:</label>
                    <input
                        type="text"
                        name="subject"
                        placeholder="Enter subject"
                        className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 text-black"
                    />
                </div>
                <div>
                    <label className={`${labelClasses}`}>Message:</label>
                    <textarea
                        type="text"
                        name="message"
                        required
                        placeholder="Enter message"
                        className="w-full h-32 min-h-[8rem] max-h-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-400 text-black"
                    />
                </div>
                <button
                    type="submit"
                    className={`${buttonClasses}`}
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default Contact;
