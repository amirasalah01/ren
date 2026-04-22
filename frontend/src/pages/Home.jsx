import { useEffect, useState } from "react";
import { FiSearch, FiMapPin, FiSliders, FiX } from "react-icons/fi";
import PropertyCard from "../components/property/PropertyCard";
import api from "../api";

const PROPERTY_TYPES = [
  { label: "All", value: "" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
  { label: "Condo", value: "condo" },
];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    city: "",
    property_type: "",
    bedrooms: "",
    price_min: "",
    price_max: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties(params = {}) {
    try {
      setLoading(true);
      const response = await api.get("/properties/list/", { params });
      const data = response.data;
      setProperties(Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function buildParams() {
    const p = {};
    if (filters.search) p.search = filters.search;
    if (filters.city) p.city = filters.city;
    if (filters.property_type) p.property_type = filters.property_type;
    if (filters.bedrooms) p.bedrooms = filters.bedrooms;
    if (filters.price_min) p.price_min = filters.price_min;
    if (filters.price_max) p.price_max = filters.price_max;
    return p;
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchProperties(buildParams());
  }

  function handleTypeSelect(value) {
    const updated = { ...filters, property_type: filters.property_type === value ? "" : value };
    setFilters(updated);
    fetchProperties({ ...buildParams(), property_type: updated.property_type });
  }

  function clearFilters() {
    const cleared = { search: "", city: "", property_type: "", bedrooms: "", price_min: "", price_max: "" };
    setFilters(cleared);
    fetchProperties();
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Find your perfect place
          </h1>
          <p className="text-slate-500 text-lg">
            Rent apartments, houses, villas and more with Renty
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-full shadow-md border border-slate-200 p-2 flex items-center gap-2">
            <div className="flex items-center gap-3 px-4 flex-1">
              <FiMapPin className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                name="search"
                placeholder="Search by title, city, description..."
                value={filters.search}
                onChange={handleChange}
                className="w-full outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
              />
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 border-l border-slate-200">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={filters.city}
                onChange={handleChange}
                className="w-28 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition border ${
                activeFilterCount > 0 && showFilters
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <FiSliders />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded-full hover:bg-blue-700 transition font-medium flex items-center gap-2 shadow-sm flex-shrink-0"
            >
              <FiSearch />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mt-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-800">Advanced Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                  <FiX className="text-xs" />Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Min Price (DZD)</label>
                <input
                  type="number"
                  name="price_min"
                  value={filters.price_min}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Max Price (DZD)</label>
                <input
                  type="number"
                  name="price_max"
                  value={filters.price_max}
                  onChange={handleChange}
                  placeholder="Any"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  placeholder="Any city"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => fetchProperties(buildParams())}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Type Filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {PROPERTY_TYPES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleTypeSelect(value)}
              className={`px-5 py-2 rounded-full text-sm transition border ${
                filters.property_type === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            {loading ? "Loading..." : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"} found`}
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-100 rounded-3xl h-72 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-500 text-lg">No properties found matching your filters.</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}