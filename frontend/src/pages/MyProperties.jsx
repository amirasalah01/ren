import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiHome, FiDroplet, FiMapPin } from "react-icons/fi";
import { deleteProperty, getMyProperties } from "../api/properties";

const API_BASE = "http://127.0.0.1:8000";

export default function MyProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  async function fetchMyProperties() {
    try {
      setLoading(true);
      const data = await getMyProperties();
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
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete property.");
    }
  }

  function getImageUrl(property) {
    if (!property.main_image) return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80";
    if (property.main_image.startsWith("http")) return property.main_image;
    return `${API_BASE}${property.main_image}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Properties</h1>
          <p className="text-slate-500 mt-1">{properties.length} listing{properties.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          to="/create-property"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <FiPlus />
          Add Property
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-slate-500 text-lg mb-6">You haven't listed any properties yet.</p>
          <Link
            to="/create-property"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition font-medium"
          >
            <FiPlus />
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition"
            >
              <img
                src={getImageUrl(property)}
                alt={property.title}
                className="w-full sm:w-44 h-36 sm:h-auto object-cover flex-shrink-0"
              />
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      to={`/properties/${property.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition leading-snug"
                    >
                      {property.title}
                    </Link>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${property.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {property.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                    <FiMapPin className="flex-shrink-0" />
                    <span>{[property.city, property.country].filter(Boolean).join(", ") || "No location"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 text-sm">
                    <span className="flex items-center gap-1"><FiHome />{property.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><FiDroplet />{property.bathrooms} bath</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="font-semibold text-slate-900">
                    {Number(property.price_per_month).toLocaleString()} DZD
                    <span className="text-slate-500 font-normal text-sm"> / month</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="flex items-center gap-1.5 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50 transition text-sm"
                    >
                      <FiEdit2 className="text-blue-500" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center gap-1.5 border border-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition text-sm"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}