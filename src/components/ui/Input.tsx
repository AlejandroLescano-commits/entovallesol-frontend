import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...rest }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      ref={ref}
      className={clsx(
        "border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary",
        error ? "border-red-400" : "border-gray-300",
        className
      )}
      {...rest}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
));
Input.displayName = "Input";
export default Input;
