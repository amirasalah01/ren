import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUpload, FiX, FiMapPin } from "react-icons/fi";
import { getProperty, updateProperty, uploadPropertyImage, deletePropertyImage } from "../api/properties";
import { safeSrc } from "../utils/sanitize";
import { CITIES_BY_GOUVERNEMENT, TUNISIA_BOUNDS, TUNISIA_CENTER, TUNISIA_GOUVERNEMENTS } from "../utils/tunisia";

const PROPERTY_TYPES = ["apartment", "house", "condo", "villa", "studio"];

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProperty(id);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          address: data.address || "",
          gouvernement: data.gouvernement || "",
          city: data.city || "",
          country: data.country || "Tunisia",
          bedrooms: data.bedrooms || "",
          bathrooms: data.bathrooms || "",
          square_feet: data.square_feet || "",
          property_type: data.property_type || "apartment",
          price_per_month: data.price_per_month || "",
          price_per_day: data.price_per_day || "",
          available_from: data.available_from || "",
          is_available: data.is_available ?? true,
          latitude: data.latitude || "",
          longitude: data.longitude || "",
        });
        if (data.main_image) {
          setMainImagePreview(data.main_image);
        }
        if (data.images && data.images.length > 0) {
          setExistingImages(data.images);
        }
      } catch {
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Initialize map after form data loads — restricted to Tunisia
  useEffect(() => {
    if (!formData || !mapRef.current || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const lat = parseFloat(formData.latitude) || TUNISIA_CENTER[0];
      const lng = parseFloat(formData.longitude) || TUNISIA_CENTER[1];
      const zoom = formData.latitude ? 13 : 6;

      const map = L.map(mapRef.current, {
        maxBounds: TUNISIA_BOUNDS,
        maxBoundsViscosity: 1.0,
      }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      if (formData.latitude && formData.longitude) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      map.on("click", (e) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng]).addTo(map);
        }
        setFormData((prev) => ({
          ...prev,
          latitude: newLat.toFixed(6),
          longitude: newLng.toFixed(6),
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
  }, [formData === null ? null : "loaded"]);

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
    setMainImage(null);
    setMainImagePreview(null);
  }

  function markExistingImageForDeletion(imageId) {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function handleAdditionalImagesChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setAdditionalImages((prev) => [...prev, ...files]);
    setAdditionalPreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  }

  function removeAdditionalImage(index) {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.price_per_month && !formData.price_per_day) {
      setError("Please enter at least one price (per month or per day).");
      return;
    }
    setSaving(true);
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

      await updateProperty(id, data);

      // Delete removed images
      if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map((imgId) => deletePropertyImage(imgId).catch(() => null)));
      }
      // Upload new additional images
      if (additionalImages.length > 0) {
        await Promise.all(additionalImages.map((file) => uploadPropertyImage(id, file).catch(() => null)));
      }

      navigate(`/properties/${id}`);
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === "object") {
        const msgs = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setError(msgs);
      } else {
        setError("Failed to update property.");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const availableCities = formData?.gouvernement ? (CITIES_BY_GOUVERNEMENT[formData.gouvernement] || []) : [];

  if (loading) {
    return <div className="p-10 text-slate-500">Loading...</div>;
  }

  if (!formData) {
    return <div className="p-10 text-red-500">{error || "Property not found."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Property</h1>
      <p className="text-slate-500 mb-8">Update the details of your listing.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputCls} />
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
            <input name="address" value={formData.address} onChange={handleChange} className={inputCls} required />
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
              Pin on Map — Tunisia (click to update location)
            </label>
            <div ref={mapRef} className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200" />
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-slate-500 mt-1">
                Location: {formData.latitude}, {formData.longitude}
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
              <input type="number" min="0" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms *</label>
              <input type="number" min="0" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Area (m²)</label>
              <input type="number" min="0" name="square_feet" value={formData.square_feet} onChange={handleChange} className={inputCls} />
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

        {/* Photo */}
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
                <span className="text-slate-500 text-sm">Click to upload new photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Additional Photos</p>
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden h-28">
                    <img src={safeSrc(img.image)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => markExistingImageForDeletion(img.id)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50 transition"
                    >
                      <FiX className="text-red-500 text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {additionalPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {additionalPreviews.map((src, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden h-28">
                    <img src={safeSrc(src)} alt={`New photo ${idx + 1}`} className="w-full h-full object-cover" />
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/properties/${id}`)}
            className="flex-1 border border-slate-300 text-slate-700 rounded-2xl py-4 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-2xl py-4 font-semibold hover:bg-blue-700 transition disabled:opacity-70 shadow-sm"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

