"use client";

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  disabled,
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-medium mb-2">
          {label}
          {required && <span className="text-[#E91E63]">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] transition text-gray-900 placeholder-gray-400 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
