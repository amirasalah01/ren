import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Renty logo" className="h-20 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/create-property"
              className="hidden md:block text-sm font-medium text-slate-700 hover:text-slate-900 transition border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50"
            >
              + List property
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm hover:shadow transition"
            >
              <span className="text-slate-700 text-lg">☰</span>
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                ◯
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="py-2">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800 font-medium"
                        onClick={closeMenu}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800"
                        onClick={closeMenu}
                      >
                        Sign up
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-5 py-3 border-b border-slate-200">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium text-slate-700 break-all">
                          {userEmail}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800"
                        onClick={closeMenu}
                      >
                        👤 Profile
                      </Link>

                      <Link
                        to="/favorites"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800"
                        onClick={closeMenu}
                      >
                        ❤️ Favorites
                      </Link>

                      <Link
                        to="/inbox"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800"
                        onClick={closeMenu}
                      >
                        📬 Inbox
                      </Link>

                      <Link
                        to="/create-property"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800"
                        onClick={closeMenu}
                      >
                        🏠 Add property
                      </Link>

                      <Link
                        to="/my-properties"
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-800"
                        onClick={closeMenu}
                      >
                        📋 My properties
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-5 py-3 hover:bg-slate-50 text-slate-800"
                      >
                        🚪 Logout
                      </button>
                    </>
                  )}

                  <div className="border-t my-2"></div>

                  <button className="block w-full text-left px-5 py-3 hover:bg-slate-50 text-slate-500 text-sm">
                    Help Center
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}