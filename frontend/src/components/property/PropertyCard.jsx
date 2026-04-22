import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition border border-slate-100 block"
    >
      <div className="relative">
        <img
          src={
            property.image ||
            property.main_image ||
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
          }
          alt={property.title}
          className="w-full h-60 object-cover"
        />

        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
        >
          ♡
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-900 leading-snug">
            {property.title}
          </h3>
          <span className="text-sm text-slate-700">
            ★ {property.rating || "4.8"}
          </span>
        </div>

        <p className="text-slate-500 text-sm mb-3">
          {property.location || property.city || "Unknown location"}
        </p>

        <p className="text-slate-900 font-semibold">
          ${property.price}
          <span className="text-slate-500 font-normal"> / night</span>
        </p>
      </div>
    </Link>
  );
}