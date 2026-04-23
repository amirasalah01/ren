import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiMapPin } from "react-icons/fi";
import { createProperty, uploadPropertyImage } from "../api/properties";
import { safeSrc } from "../utils/sanitize";
import { CITIES_BY_GOUVERNEMENT, TUNISIA_BOUNDS, TUNISIA_CENTER, TUNISIA_GOUVERNEMENTS } from "../utils/tunisia";

const PROPERTY_TYPES = ["apartment", "house", "condo", "villa", "studio"];

export default function CreateProperty() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    gouvernement: "",
    city: "",
    country: "Tunisia",
    bedrooms: "",
    bathrooms: "",
    square_feet: "",
    property_type: "apartment",
    price_per_month: "",
    price_per_day: "",
    available_from: "",
    is_available: true,
    latitude: "",
    longitude: "",
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  // Refs to hold current preview URLs for cleanup on unmount (avoids stale closure)
  const mainImagePreviewRef = useRef(null);
  const additionalPreviewsRef = useRef([]);

  const availableCities = formData.gouvernement ? (CITIES_BY_GOUVERNEMENT[formData.gouvernement] || []) : [];

  // Initialize Leaflet map for location picking — restricted to Tunisia
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) return;

    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        maxBounds: TUNISIA_BOUNDS,
        maxBoundsViscosity: 1.0,
      }).setView(TUNISIA_CENTER, 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
      });

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Keep refs in sync so the unmount cleanup always sees the latest URLs
  useEffect(() => { mainImagePreviewRef.current = mainImagePreview; }, [mainImagePreview]);
  useEffect(() => { additionalPreviewsRef.current = additionalPreviews; }, [additionalPreviews]);

  // Revoke all remaining blob preview URLs when the component unmounts
  useEffect(() => {
    return () => {
      const mp = mainImagePreviewRef.current;
      if (mp && mp.startsWith("blob:")) URL.revokeObjectURL(mp);
      additionalPreviewsRef.current.forEach((url) => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
    };
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "gouvernement") {
      setFormData((prev) => ({ ...prev, gouvernement: value, city: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    if (mainImagePreview && mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImage(null);
    setMainImagePreview(null);
  }

  function handleAdditionalImagesChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setAdditionalImages((prev) => [...prev, ...files]);
    setAdditionalPreviews((prev) => [...prev, ...previews]);
    // Reset input so same files can be re-selected if needed
    e.target.value = "";
  }

  function removeAdditionalImage(index) {
    const url = additionalPreviews[index];
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.price_per_month && !formData.price_per_day) {
      setError("Please enter at least one price (per month or per day).");
      return;
    }
    if (!formData.address || !formData.gouvernement || !formData.city) {
      setError("Please fill in all location fields (address, gouvernement, and city).");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== "" && val !== null && val !== undefined) {
          data.append(key, val);
        }
      });
      if (mainImage) {
        data.append("main_image", mainImage);
      }

      const result = await createProperty(data);

      // Upload additional images via PropertyImage model
      if (additionalImages.length > 0) {
        const results = await Promise.all(
          additionalImages.map((file) => uploadPropertyImage(result.id, file).then(() => true).catch(() => false))
        );
        const failedCount = results.filter((ok) => !ok).length;
        if (failedCount > 0) {
          // Navigate to the property but warn about failed uploads
          navigate(`/properties/${result.id}`, {
            state: { warning: `${failedCount} photo(s) could not be uploaded. You can add them again from the edit page.` },
          });
          return;
        }
      }

      navigate(`/properties/${result.id}`);
    } catch (err) {
      console.error(err);
      const errData = err.response?.data;
      if (errData && typeof errData === "object") {
        // Backend wraps validation errors as { error: true, status, message, data: { field: [...] } }
        const innerData = errData.error === true && errData.data && typeof errData.data === "object"
          ? errData.data
          : errData;
        const msgs = Object.entries(innerData)
          .filter(([k]) => !["error", "status", "message", "data"].includes(k))
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : v}`)
          .join(" | ");
        setError(msgs || errData.message || "Failed to create property. Please check all fields.");
      } else {
        setError("Failed to create property. Please check all fields.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Property</h1>
      <p className="text-slate-500 mb-8">Fill in the details to list your property.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} className={inputCls} required placeholder="e.g. Cozy apartment in downtown" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputCls} placeholder="Describe your property..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Type *</label>
            <select name="property_type" value={formData.property_type} onChange={handleChange} className={inputCls}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Location</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
            <input name="address" value={formData.address} onChange={handleChange} className={inputCls} required placeholder="Street address" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gouvernement *</label>
            <select name="gouvernement" value={formData.gouvernement} onChange={handleChange} className={inputCls} required>
              <option value="">Select gouvernement...</option>
              {TUNISIA_GOUVERNEMENTS.map((g) => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
            <select name="city" value={formData.city} onChange={handleChange} className={inputCls} required disabled={!formData.gouvernement}>
              <option value="">{formData.gouvernement ? "Select city..." : "Select gouvernement first"}</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input name="country" value={formData.country} readOnly className={`${inputCls} bg-slate-50 text-slate-500`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <FiMapPin className="inline mr-1" />
              Pin on Map — Tunisia (click to set location)
            </label>
            <div ref={mapRef} className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200" />
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-slate-500 mt-1">
                Selected: {formData.latitude}, {formData.longitude}
              </p>
            )}
          </div>
        </section>

        {/* Details */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Details</h2>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms *</label>
              <input type="number" min="0" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className={inputCls} required placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms *</label>
              <input type="number" min="0" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className={inputCls} required placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Area (m²)</label>
              <input type="number" min="0" name="square_feet" value={formData.square_feet} onChange={handleChange} className={inputCls} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price / month (TND)</label>
              <input type="number" min="0" name="price_per_month" value={formData.price_per_month} onChange={handleChange} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price / day (TND)</label>
              <input type="number" min="0" name="price_per_day" value={formData.price_per_day} onChange={handleChange} className={inputCls} placeholder="0" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Enter at least one price (per month or per day).</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Available from</label>
              <input type="date" name="available_from" value={formData.available_from} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_available" name="is_available" checked={formData.is_available} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700">Property is currently available</label>
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Photos</h2>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Main Photo</p>
            {mainImagePreview ? (
              <div className="relative">
                <img src={safeSrc(mainImagePreview)} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
                <button type="button" onClick={removeImage} className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-red-50 transition">
                  <FiX className="text-red-500" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <FiUpload className="text-slate-400 text-2xl mb-2" />
                <span className="text-slate-500 text-sm">Click to upload main photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Additional Photos</p>
            {additionalPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {additionalPreviews.map((src, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden h-28">
                    <img src={safeSrc(src)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(idx)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50 transition"
                    >
                      <FiX className="text-red-500 text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <FiUpload className="text-slate-400 text-xl mb-1" />
              <span className="text-slate-500 text-sm">Click to add more photos</span>
              <span className="text-slate-400 text-xs mt-0.5">You can select multiple images at once</span>
              <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="hidden" />
            </label>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-70 shadow-sm"
        >
          {loading ? "Creating..." : "Publish Property"}
        </button>
      </form>
    </div>
  );
}
