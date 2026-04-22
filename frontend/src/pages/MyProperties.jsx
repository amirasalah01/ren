import { useEffect, useState } from "react";
import { deleteProperty, getProperties } from "../api/properties";

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  async function fetchMyProperties() {
    try {
      setLoading(true);
      const data = await getProperties();

      if (Array.isArray(data)) {
        setProperties(data);
      } else if (Array.isArray(data.results)) {
        setProperties(data.results);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Failed to fetch my properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this property?");
    if (!confirmed) return;

    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((property) => property.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete property.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Properties</h1>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading properties...</p>
      ) : properties.length === 0 ? (
        <p className="text-slate-500">No properties yet.</p>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <h2 className="font-semibold text-slate-900">{property.title}</h2>
                <p className="text-slate-500 text-sm">
                  {property.location || property.city || "Unknown location"}
                </p>
                <p className="text-slate-900 font-medium mt-1">
                  ${property.price} / night
                </p>
              </div>

              <button
                onClick={() => handleDelete(property.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}