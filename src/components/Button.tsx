"use client";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-[#E91E63] text-white hover:bg-[#C2185B] focus:ring-[#E91E63]",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600",
    outline:
      "border-2 border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white focus:ring-[#E91E63]",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}
