import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Favorites from "../pages/Favorites";
import Inbox from "../pages/Inbox";
import MyProperties from "../pages/MyProperties";
import PropertyDetail from "../pages/PropertyDetail";
import CreateProperty from "../pages/CreateProperty";

export default function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-properties"
          element={
            <ProtectedRoute>
              <MyProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-property"
          element={
            <ProtectedRoute>
              <CreateProperty />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}