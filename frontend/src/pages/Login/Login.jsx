import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { clearAuthStatus, loginUser } from "../../features/auth/authSlice.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const nextErrors = {};

    if (!emailPattern.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validate()) {
      dispatch(loginUser(formData));
    }
  };

  return (
    <section className="bg-champagne px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-md bg-white shadow-soft md:grid-cols-2">
        <div className="hidden bg-ink md:block">
          <img
            src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1100&q=80"
            alt="Jewellery display"
            className="h-full w-full object-cover opacity-85"
          />
        </div>
        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Welcome back</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">Login to your account</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">Access your profile and continue exploring Himapriya collections.</p>

          {error && <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
            />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                error={errors.password}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-9 rounded-full p-2 text-ink/55 hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/65">
            New to Himapriya?{" "}
            <Link to="/signup" className="font-semibold text-bronze hover:text-rosewood">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
