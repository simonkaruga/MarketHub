const Input = ({
  label,
  type = 'text',
  error,
  icon,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="label">{label}</label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400 transition-opacity duration-200 peer-focus:opacity-0 peer-not-placeholder-shown:opacity-0">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={`input-field peer ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
