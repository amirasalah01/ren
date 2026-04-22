import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMapPin, FiHome } from "react-icons/fi";
import { getFavorites, removeFavorite } from "../api/properties";

const API_BASE = "http://127.0.0.1:8000";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const data = await getFavorites();
      if (Array.isArray(data)) {
        setFavorites(data);
      } else if (Array.isArray(data.results)) {
        setFavorites(data.results);
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(favoriteId) {
    try {
      await removeFavorite(favoriteId);
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch {
      alert("Failed to remove favorite.");
    }
  }

  function getImageUrl(property) {
    if (!property.main_image) return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80";
    if (property.main_image.startsWith("http")) return property.main_image;
    return `${API_BASE}${property.main_image}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Favorites</h1>
        <p className="text-slate-500 mt-1">{favorites.length} saved propert{favorites.length !== 1 ? "ies" : "y"}</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-3xl h-64 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💛</div>
          <p className="text-slate-500 text-lg mb-4">You haven't saved any properties yet.</p>
          <Link to="/" className="text-blue-600 hover:underline font-medium">Explore properties</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ id: favId, property_detail }) => {
            if (!property_detail) return null;
            return (
              <div key={favId} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative">
                  <Link to={`/properties/${property_detail.id}`}>
                    <img
                      src={getImageUrl(property_detail)}
                      alt={property_detail.title}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(favId)}
                    className="absolute top-3 right-3 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-red-50 transition"
                    title="Remove from favorites"
                  >
                    <FiHeart className="text-red-500 fill-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/properties/${property_detail.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition block mb-1 leading-snug">
                    {property_detail.title}
                  </Link>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                    <FiMapPin className="flex-shrink-0" />
                    <span>{[property_detail.city, property_detail.country].filter(Boolean).join(", ") || "No location"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <FiHome />{property_detail.bedrooms} bed
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {Number(property_detail.price_per_month).toLocaleString()} DZD<span className="text-slate-500 font-normal">/mo</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}