import { forwardRef } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Input = /*#__PURE__*/forwardRef(({
  label,
  error,
  className = "",
  ...props
}, ref) => {
  return /*#__PURE__*/_jsxs("div", {
    className: "w-full",
    children: [label && /*#__PURE__*/_jsx("label", {
      className: "block text-sm mb-2 text-foreground",
      children: label
    }), /*#__PURE__*/_jsx("input", {
      ref: ref,
      className: `w-full px-4 py-3 rounded-xl border border-input bg-input-background
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            transition-all duration-200 ${error ? 'border-destructive' : ''} ${className}`,
      ...props
    }), error && /*#__PURE__*/_jsx("p", {
      className: "mt-1 text-sm text-destructive",
      children: error
    })]
  });
});
Input.displayName = "Input";
