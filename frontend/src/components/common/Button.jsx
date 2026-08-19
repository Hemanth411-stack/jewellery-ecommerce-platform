import Loader from "./Loader.jsx";

function Button({
  children,
  as: Component = "button",
  type = "button",
  variant = "primary",
  isLoading = false,
  className = "",
  ...props
}) {
  const styles = {
    primary: "bg-ink text-white hover:bg-rosewood",
    secondary: "border border-ink/15 bg-white text-ink hover:border-bronze",
    accent: "bg-bronze text-white hover:bg-rosewood",
  };

  return (
    <Component
      {...(Component === "button" ? { type } : {})}
      disabled={isLoading || props.disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader size="sm" />}
      {children}
    </Component>
  );
}

export default Button;
