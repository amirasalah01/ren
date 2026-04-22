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

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
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
          <input name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />

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