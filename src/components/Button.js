import React from "react";

/**
 * Reusable button component, same color as the primary color specified in tailwind.config.js.
 *
 * Example: A button with the text "Hello World!":
 *
 * `<Button>Hello World!</Button>`
 *
 *
 * Example: A button with red text and a border:
 *
 * `<Button className="text-red border">Red Button</Button>`
 *
 */
function Button({ children, className }) {
  return (
    <button
      className={`inline-block bg-primary hover:bg-secondary px-8 py-4 cursor-pointer rounded-md text-center text-white text-lg transition duration-300 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
