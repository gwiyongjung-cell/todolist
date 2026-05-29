interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const variantClass: Record<string, string> = {
  primary:
    'bg-primary hover:bg-primary-dark text-white disabled:bg-gray-300 disabled:cursor-not-allowed',
  secondary:
    'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-red-50 hover:bg-red-100 text-danger border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed',
};

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-semibold transition-colors ${variantClass[variant]} ${className}`}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
