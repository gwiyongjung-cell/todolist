interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
}

export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  error,
  disabled = false,
}: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          aria-invalid={!!error}
          className={`w-full px-3.5 py-2.5 rounded-md text-sm text-gray-900 border outline-none transition-all
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error
              ? 'border-danger focus:ring-2 focus:ring-red-100'
              : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary-light'
            }`}
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
