import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateProperty() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    property_type: "Apartment",
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
      const response = await api.post("/properties/list/", formData);
      const data = response.data;
      navigate(`/properties/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create property.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Add New Property</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <select
          name="property_type"
          value={formData.property_type}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Apartment</option>
          <option>House</option>
          <option>Villa</option>
          <option>Studio</option>
        </select>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-2xl py-3 font-medium hover:bg-blue-700 transition disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Property"}
        </button>
      </form>
    </div>
  );
}