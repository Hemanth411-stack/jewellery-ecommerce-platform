function Loader({ size = "md" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${sizes[size]}`}
      aria-label="Loading"
    />
  );
}

export default Loader;
