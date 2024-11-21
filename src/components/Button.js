import React from "react";
import PropTypes from "prop-types";


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
function Button({ type="button", onClick, children, className, disabled = false }) {
  return (
    <button
      type={type}
      onClick = {onClick}
      disabled = {disabled}
      className={`inline-block bg-primary hover:bg-secondary px-8 py-4 cursor-pointer rounded-md text-center text-white text-lg transition duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""} $(className}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default Button;
