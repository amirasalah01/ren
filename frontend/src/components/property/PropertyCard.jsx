import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMapPin, FiHome } from "react-icons/fi";
import { addFavorite, removeFavorite } from "../../api/properties";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "http://127.0.0.1:8000";

function getImageUrl(src) {
  if (!src) return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80";
  if (src.startsWith("http")) return src;
  return `${API_BASE}${src}`;
}

export default function PropertyCard({ property }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(property.is_favorite || false);
  const [favId, setFavId] = useState(property.favorite_id || null);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite(e) {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/login"); return; }
    setLoading(true);
    try {
      if (isFav && favId) {
        await removeFavorite(favId);
        setIsFav(false);
        setFavId(null);
      } else {
        const fav = await addFavorite(property.id);
        setIsFav(true);
        setFavId(fav.id);
      }
    } catch {/* ignore */}
    setLoading(false);
  }

  const imgUrl = getImageUrl(property.main_image);
  const location = [property.city, property.gouvernement].filter(Boolean).join(", ") || [property.city, property.country].filter(Boolean).join(", ") || "Tunisia";
  const priceMonthly = property.price_per_month ? `${Number(property.price_per_month).toLocaleString()} TND / mo` : null;
  const priceDaily = property.price_per_day ? `${Number(property.price_per_day).toLocaleString()} TND / day` : null;
  const price = priceMonthly || priceDaily || "—";
  const rating = property.average_rating || null;

  return (
    <Link
      to={`/properties/${property.id}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-100 block group"
    >
      <div className="relative">
        <img
          src={imgUrl}
          alt={property.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <button
          onClick={toggleFavorite}
          disabled={loading}
          className={`absolute top-4 right-4 rounded-full w-10 h-10 flex items-center justify-center shadow-sm transition ${
            isFav ? "bg-white text-red-500" : "bg-white/90 text-slate-400 hover:text-red-400"
          }`}
        >
          <FiHeart className={isFav ? "fill-red-500" : ""} />
        </button>

        {!property.is_available && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Unavailable
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-1">
            {property.title}
          </h3>
          {rating && (
            <span className="text-sm text-slate-700 flex-shrink-0">
              ★ {rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
          <FiMapPin className="flex-shrink-0 text-xs" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-slate-900 font-semibold text-sm">
            {price}
            {priceMonthly && priceDaily && (
              <span className="block text-slate-400 font-normal text-xs">{priceDaily}</span>
            )}
          </p>
          {property.bedrooms !== undefined && (
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <FiHome />{property.bedrooms} bed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}