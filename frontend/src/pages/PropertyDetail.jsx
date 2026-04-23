import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMapPin, FiHome, FiDroplet, FiSquare, FiHeart, FiStar, FiSend, FiUser } from "react-icons/fi";
import { getProperty, addFavorite, removeFavorite, getReviews, createReview, deleteReview } from "../api/properties";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://127.0.0.1:8000";

function getImageUrl(src) {
  if (!src) return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80";
  if (src.startsWith("http")) return src;
  return `${API_BASE}${src}`;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriting, setFavoriting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  async function fetchProperty() {
    try {
      setLoading(true);
      const data = await getProperty(id);
      setProperty(data);

      const revData = await getReviews(id);
      const list = Array.isArray(revData) ? revData : revData.results || [];
      setReviews(list);
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }

  // Initialize map when property loads with coordinates
  useEffect(() => {
    if (!property?.latitude || !property?.longitude || !mapRef.current) return;
    if (leafletMapRef.current) return;

    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);

      const map = L.map(mapRef.current).setView([lat, lng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${property.title}</b><br>${property.address}`)
        .openPopup();

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [property?.latitude, property?.longitude]);

  async function toggleFavorite() {
    if (!isAuthenticated) { navigate("/login"); return; }
    setFavoriting(true);
    try {
      if (property.is_favorite && property.favorite_id) {
        await removeFavorite(property.favorite_id);
        setProperty((p) => ({ ...p, is_favorite: false, favorite_id: null }));
      } else {
        const fav = await addFavorite(property.id);
        setProperty((p) => ({ ...p, is_favorite: true, favorite_id: fav.id }));
      }
    } catch {/* ignore */}
    setFavoriting(false);
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/login"); return; }
    setSubmittingReview(true);
    setReviewError("");
    try {
      const newReview = await createReview(id, reviewForm);
      setReviews((prev) => [newReview, ...prev]);
      setReviewForm({ rating: 5, title: "", comment: "" });
    } catch (err) {
      const d = err.response?.data;
      if (d?.non_field_errors) setReviewError(d.non_field_errors[0]);
      else setReviewError("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      alert("Failed to delete review.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-slate-100 rounded-3xl h-96 animate-pulse mb-8" />
        <div className="space-y-3">
          <div className="bg-slate-100 rounded-xl h-8 w-2/3 animate-pulse" />
          <div className="bg-slate-100 rounded-xl h-5 w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) {
    return <div className="p-8 text-red-500">Property not found.</div>;
  }

  const allImages = [
    property.main_image,
    ...(property.images || []).map((img) => img.image),
  ].filter(Boolean);

  const mainImg = allImages.length > 0
    ? getImageUrl(allImages[0])
    : getImageUrl(null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Image Gallery */}
      {allImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 rounded-3xl overflow-hidden mb-8 h-96">
          <div className="col-span-2 row-span-2">
            <img src={getImageUrl(allImages[0])} alt={property.title} className="w-full h-full object-cover" />
          </div>
          {allImages.slice(1, 3).map((img, i) => (
            <img key={i} src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
          ))}
        </div>
      ) : (
        <img src={mainImg} alt={property.title} className="w-full h-96 object-cover rounded-3xl mb-8" />
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-slate-500">
                <FiMapPin />
                <span>{[property.address, property.gouvernement, property.city, property.country].filter(Boolean).join(", ") || "Location not specified"}</span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              disabled={favoriting}
              className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition shadow-sm ${
                property.is_favorite
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-slate-200 text-slate-400 hover:text-red-400"
              }`}
            >
              <FiHeart className={property.is_favorite ? "fill-red-500" : ""} />
            </button>
          </div>

          {/* Key stats */}
          <div className="flex flex-wrap gap-4 py-5 border-y border-slate-200 mb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <FiHome className="text-blue-500" />
              <span className="font-medium">{property.bedrooms}</span>
              <span className="text-slate-500">bedroom{property.bedrooms !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FiDroplet className="text-blue-500" />
              <span className="font-medium">{property.bathrooms}</span>
              <span className="text-slate-500">bathroom{property.bathrooms !== 1 ? "s" : ""}</span>
            </div>
            {property.square_feet && (
              <div className="flex items-center gap-2 text-slate-700">
                <FiSquare className="text-blue-500" />
                <span className="font-medium">{property.square_feet}</span>
                <span className="text-slate-500">m²</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-700">
              <FiStar className="text-yellow-400" />
              <span className="font-medium">{property.average_rating || "—"}</span>
              <span className="text-slate-500">({property.review_count} review{property.review_count !== 1 ? "s" : ""})</span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">About this property</h2>
              <p className="text-slate-700 leading-7">{property.description}</p>
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Location</h2>
              <div ref={mapRef} className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200" />
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Location</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-500 text-sm">
                <FiMapPin className="inline mr-1" />
                {[property.address, property.gouvernement, property.city, property.country].filter(Boolean).join(", ") || "Location not specified"}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Reviews
              {property.review_count > 0 && (
                <span className="ml-2 text-slate-500 font-normal text-base">
                  ★ {property.average_rating} · {property.review_count} review{property.review_count !== 1 ? "s" : ""}
                </span>
              )}
            </h2>

            {/* Write review */}
            {isAuthenticated && (
              <form onSubmit={submitReview} className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-3 border border-slate-200">
                <h3 className="font-medium text-slate-800">Write a review</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Rating:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                        className={`text-xl transition ${star <= reviewForm.rating ? "text-yellow-400" : "text-slate-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  placeholder="Review title"
                  required
                />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  placeholder="Share your experience..."
                  required
                />
                {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium disabled:opacity-70"
                >
                  <FiSend className="text-xs" />
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                          <FiUser className="text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{review.reviewer?.username}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-slate-200"}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                        {review.reviewer?.id === userId && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-slate-800 text-sm mb-1">{review.title}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking/Contact sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24">
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {property.price_per_month
                ? <>{Number(property.price_per_month).toLocaleString()} <span className="text-base text-slate-500 font-normal">TND / month</span></>
                : property.price_per_day
                  ? <>{Number(property.price_per_day).toLocaleString()} <span className="text-base text-slate-500 font-normal">TND / day</span></>
                  : "Price on request"
              }
            </p>
            {property.price_per_month && property.price_per_day && (
              <p className="text-sm text-slate-500 mb-2">
                {Number(property.price_per_day).toLocaleString()} TND / day
              </p>
            )}

            <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
              <FiStar className="text-yellow-400" />
              <span>{property.average_rating || "—"}</span>
              <span>·</span>
              <span>{property.review_count} review{property.review_count !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6 bg-slate-50 rounded-2xl p-4">
              <div className="flex justify-between">
                <span>Type</span>
                <span className="font-medium text-slate-800 capitalize">{property.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-medium ${property.is_available ? "text-green-600" : "text-red-500"}`}>
                  {property.is_available ? "Available" : "Unavailable"}
                </span>
              </div>
              {property.available_from && (
                <div className="flex justify-between">
                  <span>Available from</span>
                  <span className="font-medium text-slate-800">{new Date(property.available_from).toLocaleDateString()}</span>
                </div>
              )}
              {property.owner && (
                <div className="flex justify-between">
                  <span>Owner</span>
                  <span className="font-medium text-slate-800">@{property.owner.username}</span>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => navigate(`/inbox?user_id=${property.owner?.id}&username=${property.owner?.username}`)}
                className="w-full bg-blue-600 text-white rounded-2xl py-3 font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Contact Owner
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 text-white rounded-2xl py-3 font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Log in to contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}