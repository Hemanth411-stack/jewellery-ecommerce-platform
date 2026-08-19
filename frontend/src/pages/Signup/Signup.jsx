import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { clearAuthStatus, registerUser } from "../../features/auth/authSlice.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const indianPhonePattern = /^(\+91[-\s]?)?[6-9]\d{9}$/;

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
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

    if (!formData.name.trim()) nextErrors.name = "Full name is required";
    if (!emailPattern.test(formData.email)) nextErrors.email = "Enter a valid email address";
    if (!indianPhonePattern.test(formData.phone)) nextErrors.phone = "Enter a valid Indian phone number";
    if (formData.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password) nextErrors.confirmPassword = "Passwords do not match";

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
      const { confirmPassword, ...payload } = formData;
      dispatch(registerUser(payload));
    }
  };

  return (
    <section className="bg-champagne px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-md bg-white shadow-soft md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Join Himapriya</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">Save your profile now. Wishlist and cart modules will plug into this account later.</p>

          {error && <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" error={errors.name} />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" error={errors.phone} />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
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
            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-9 rounded-full p-2 text-ink/55 hover:text-ink"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/65">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-bronze hover:text-rosewood">
              Login
            </Link>
          </p>
        </div>
        <div className="hidden bg-ink md:block">
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1100&q=80"
            alt="Gold jewellery"
            className="h-full w-full object-cover opacity-85"
          />
        </div>
      </div>
    </section>
  );
}

export default Signup;
