interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}: InputProps) {
  const errorId = `error-${label}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span aria-hidden="true" className="text-danger ml-0.5">*</span>}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full px-3.5 py-2.5 rounded-md text-sm text-gray-900 border outline-none transition-all
            placeholder:text-gray-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error
              ? 'border-danger focus:ring-2 focus:ring-red-100'
              : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary-light'
            }`}
        />
      </label>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
