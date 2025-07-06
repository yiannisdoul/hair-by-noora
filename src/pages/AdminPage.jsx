import React, { useState } from 'react';
import AdminBookingForm from '../components/AdminBookingForm';

const AdminPage = () => {
  const [showForm, setShowForm] = useState(false);
  
  // Simple password protection (you should implement proper auth)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Replace with your actual admin password
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="max-w-md w-full space-y-4 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center">Admin Access</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage bookings and appointments</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 mr-4"
          >
            {showForm ? 'Hide Form' : 'Create Manual Booking'}
          </button>
          
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>

        {showForm && (
          <AdminBookingForm 
            onBookingCreated={() => {
              setShowForm(false);
              // Optionally refresh bookings list
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
