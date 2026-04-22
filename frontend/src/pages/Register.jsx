import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      if (err.response?.data) {
        const errData = err.response.data;
        if (typeof errData === "object") {
          const messages = Object.entries(errData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ");
          setError(messages);
        } else {
          setError(String(errData));
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-2">Join Renty and start exploring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="grid grid-cols-2 gap-3">
            <input name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
          <input name="phone" placeholder="Phone (optional)" value={formData.phone} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" name="password2" placeholder="Confirm password" value={formData.password2} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-2xl py-3 font-medium hover:bg-blue-700 transition disabled:opacity-70">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}