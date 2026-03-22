import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';
import Dashboard from './pages/Dashboard';
import MyProperties from './pages/MyProperties';
import CreateProperty from './pages/CreateProperty';
import Favorites from './pages/Favorites';
import Inbox from './pages/Inbox';
import Conversation from './pages/Conversation';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/property/:id" element={<PropertyDetail />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/my-properties"
                element={
                  <PrivateRoute requireOwner={true}>
                    <MyProperties />
                  </PrivateRoute>
                }
              />

              <Route
                path="/create-property"
                element={
                  <PrivateRoute requireOwner={true}>
                    <CreateProperty />
                  </PrivateRoute>
                }
              />

              <Route
                path="/edit-property/:id"
                element={
                  <PrivateRoute requireOwner={true}>
                    <CreateProperty />
                  </PrivateRoute>
                }
              />

              <Route
                path="/favorites"
                element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                }
              />

              <Route
                path="/inbox"
                element={
                  <PrivateRoute>
                    <Inbox />
                  </PrivateRoute>
                }
              />

              <Route
                path="/conversation/:userId"
                element={
                  <PrivateRoute>
                    <Conversation />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
