function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-ink">{label}</span>}
      <input
        className={`w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-bronze focus:ring-4 focus:ring-bronze/10 ${className}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export default Input;
