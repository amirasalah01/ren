import { useEffect, useState } from "react";
import { FiCalendar, FiMapPin, FiSearch, FiUser } from "react-icons/fi";
import PropertyCard from "../components/property/PropertyCard";
import api from "../api";

const categories = ["Apartment", "House", "Villa", "Studio"];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    guests: "",
    category: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties(customParams = {}) {
    try {
      setLoading(true);

      const response = await api.get("/properties/list/", {
        params: customParams,
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setProperties(data);
      } else if (Array.isArray(data.results)) {
        setProperties(data.results);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleCategory(category) {
    const newCategory = filters.category === category ? "" : category;
    const updated = { ...filters, category: newCategory };
    setFilters(updated);

    fetchProperties({
      search: updated.search,
      property_type: updated.category,
    });
  }

  function handleSearch() {
    fetchProperties({
      search: filters.search,
      property_type: filters.category,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Find your perfect place
          </h1>
          <p className="text-slate-500 text-lg">
            Rent apartments, houses, and more with Renty
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-full shadow-md border border-slate-200 p-2 flex flex-col md:flex-row items-stretch md:items-center overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 flex-1">
            <FiMapPin className="text-slate-400 text-lg" />
            <input
              type="text"
              name="search"
              placeholder="Where are you going?"
              value={filters.search}
              onChange={handleChange}
              className="w-full outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          <div className="flex items-center gap-3 px-5 py-3 flex-1">
            <FiCalendar className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Add dates"
              className="w-full outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200" />

          <div className="flex items-center gap-3 px-5 py-3 flex-1">
            <FiUser className="text-slate-400 text-lg" />
            <input
              type="text"
              name="guests"
              placeholder="Add guests"
              value={filters.guests}
              onChange={handleChange}
              className="w-full outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
            />
          </div>

          <div className="mt-2 md:mt-0 md:ml-2">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 shadow-md w-full md:w-auto"
            >
              <FiSearch />
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategory(category)}
              className={`px-5 py-2 rounded-full text-sm transition border ${
                filters.category === category
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Popular stays
          </h2>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="text-slate-500">No properties found.</p>
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