import { useEffect, useState } from "react";
import { FiUser, FiEdit2, FiSave, FiX, FiHome, FiHeart, FiStar, FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getDashboard, getProfile, updateProfile } from "../api/user";

const API_BASE = "http://127.0.0.1:8000";

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [prof, dash] = await Promise.all([getProfile(), getDashboard()]);
        setProfile(prof);
        setDashboard(dash);
        setFormData({
          first_name: prof.first_name || "",
          last_name: prof.last_name || "",
          phone: prof.phone || "",
          bio: prof.bio || "",
        });
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (avatarFile) data.append("avatar", avatarFile);

      const updated = await updateProfile(data);
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
      setSuccess("Profile updated successfully!");
      setAvatarFile(null);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function getAvatarUrl() {
    if (avatarPreview) return avatarPreview;
    if (!profile?.avatar) return null;
    if (profile.avatar.startsWith("http")) return profile.avatar;
    return `${API_BASE}${profile.avatar}`;
  }

  if (loading) {
    return <div className="p-10 text-slate-500">Loading profile...</div>;
  }

  const avatarUrl = getAvatarUrl();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow">
                  <FiUser className="text-blue-600 text-3xl" />
                </div>
              )}
              {editing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow">
                  <FiEdit2 className="text-white text-xs" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username}
            </h2>
            <p className="text-slate-500 text-sm mt-1">@{profile?.username}</p>
            <p className="text-slate-500 text-sm mt-1">{profile?.email}</p>

            {profile?.bio && (
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-4 flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl hover:bg-slate-200 transition text-sm font-medium mx-auto"
              >
                <FiEdit2 />
                Edit Profile
              </button>
            )}
          </div>

          {/* Stats */}
          {dashboard && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-4 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Stats</h3>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 text-sm"><FiHome />Properties</span>
                <span className="font-semibold text-slate-900">{dashboard.properties?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 text-sm"><FiHeart />Favorites</span>
                <span className="font-semibold text-slate-900">{dashboard.favorites?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 text-sm"><FiStar />Avg Rating</span>
                <span className="font-semibold text-slate-900">{dashboard.reviews?.average_rating ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 text-sm"><FiMail />Unread msgs</span>
                <span className="font-semibold text-slate-900">{dashboard.messages?.unread_count || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          {editing ? (
            <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Edit Information</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First name</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last name</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="+213..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us about yourself..." />
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 rounded-2xl px-4 py-2">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null); }}
                  className="flex items-center gap-2 border border-slate-300 text-slate-700 px-5 py-3 rounded-2xl hover:bg-slate-50 transition"
                >
                  <FiX />Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition font-medium disabled:opacity-70"
                >
                  <FiSave />{saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Account Details</h2>
              {success && <p className="text-green-600 text-sm bg-green-50 rounded-2xl px-4 py-2 mb-4">{success}</p>}
              <dl className="space-y-4">
                {[
                  ["Username", profile?.username],
                  ["Email", profile?.email],
                  ["First name", profile?.first_name || "—"],
                  ["Last name", profile?.last_name || "—"],
                  ["Phone", profile?.phone || "—"],
                  ["Member since", profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="text-sm font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
