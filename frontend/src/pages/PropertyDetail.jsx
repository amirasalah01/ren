import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProperty } from "../api/properties";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  async function fetchProperty() {
    try {
      setLoading(true);
      const data = await getProperty(id);
      setProperty(data);
    } catch (error) {
      console.error("Failed to fetch property detail:", error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Loading property...</div>;
  }

  if (!property) {
    return <div className="p-8 text-red-500">Property not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <img
        src={
          property.image ||
          property.main_image ||
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
        }
        alt={property.title}
        className="w-full h-96 object-cover rounded-3xl mb-8"
      />

      <h1 className="text-3xl font-bold text-slate-900 mb-3">
        {property.title}
      </h1>

      <p className="text-slate-500 mb-4">
        {property.location || property.city || "Unknown location"}
      </p>

      <p className="text-xl font-semibold text-slate-900 mb-6">
        ${property.price} <span className="text-slate-500 font-normal">/ night</span>
      </p>

      <p className="text-slate-700 leading-7">
        {property.description || "No description available."}
      </p>
    </div>
  );
}