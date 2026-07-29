import React from "react";

const variants = {
  primary: "bg-teal text-white hover:bg-teal-deep focus-visible:outline-ink",
  navy: "bg-navy text-white hover:bg-navy-deep",
  alert: "bg-alert text-white hover:bg-alert-deep",
  ghost: "bg-transparent text-ink hover:bg-sand-dim border border-ink/15",
  subtle: "bg-teal-soft text-teal-deep hover:bg-teal-soft/70",
};

export default function Button({
  variant = "primary",
  className = "",
  as: Component = "button",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
