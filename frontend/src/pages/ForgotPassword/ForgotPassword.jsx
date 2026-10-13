import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import authService from "../../features/auth/authService.js";

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const registeredEmail = searchParams.get("email") || "";
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({ email: registeredEmail, otp: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submitEmail = async (e) => { e.preventDefault(); setLoading(true); setError(""); try { const result = await authService.requestPasswordReset(form.email); setMessage(result.message); setStep("reset"); } catch (err) { setError(err.response?.data?.message || "Unable to send OTP"); } finally { setLoading(false); } };
  const submitReset = async (e) => { e.preventDefault(); if (form.password !== form.confirmPassword) return setError("Passwords do not match"); setLoading(true); setError(""); try { const result = await authService.resetPassword({ email: form.email, otp: form.otp, password: form.password }); setMessage(result.message); setStep("done"); } catch (err) { setError(err.response?.data?.message || "Unable to reset password"); } finally { setLoading(false); } };
  return <section className="bg-champagne px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-lg rounded-md bg-white p-6 shadow-soft sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Account recovery</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">Forgot password?</h1><p className="mt-3 text-sm leading-6 text-ink/60">{step === "email" ? "We’ll send a one-time password to the email you entered for login." : "Enter the OTP from your email and choose a new password."}</p>{message && <div className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}{error && <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{step === "email" && <form className="mt-7 space-y-5" onSubmit={submitEmail}><Input label="Registered email" name="email" type="email" value={form.email} readOnly required placeholder="Return to login and enter your email first" className="bg-ink/5" /><Button type="submit" isLoading={loading} disabled={!form.email} className="w-full">Send OTP</Button></form>}{step === "reset" && <form className="mt-7 space-y-5" onSubmit={submitReset}><Input label="6-digit OTP" name="otp" inputMode="numeric" maxLength="6" value={form.otp} onChange={change} required /><Input label="New password" name="password" type="password" minLength="6" value={form.password} onChange={change} required /><Input label="Confirm new password" name="confirmPassword" type="password" minLength="6" value={form.confirmPassword} onChange={change} required /><Button type="submit" isLoading={loading} className="w-full">Reset password</Button></form>}{step === "done" && <Link to="/login" className="mt-7 inline-flex font-semibold text-bronze hover:text-rosewood">Go to login</Link>}<p className="mt-6 text-center text-sm text-ink/65"><Link to="/login" className="font-semibold text-bronze hover:text-rosewood">Back to login</Link></p></div></section>;
}

export default ForgotPassword;
