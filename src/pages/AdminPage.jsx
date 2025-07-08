import React, { useState } from 'react';
import AdminBookingForm from '../components/AdminBookingForm';

const AdminPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Hash function to match server-side hashing
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      alert('Too many failed attempts. Please wait 5 minutes.');
      return;
    }

    try {
      const hashedInput = await hashPassword(password);
      const storedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
      
      if (!storedHash) {
        alert('Admin authentication not configured');
        return;
      }

      if (hashedInput === storedHash) {
        setIsAuthenticated(true);
        setLoginAttempts(0);
        setPassword('');
        
        // Set session storage for temporary auth
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminAuthTime', Date.now().toString());
        
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        setPassword('');
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          // Unlock after 5 minutes
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
          }, 5 * 60 * 1000);
          alert('Too many failed attempts. Account locked for 5 minutes.');
        } else {
          alert(`Invalid password. ${3 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuthTime');
    setPassword('');
  };

  // Check if user is already authenticated (session-based)
  React.useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth');
    const authTime = sessionStorage.getItem('adminAuthTime');
    
    if (savedAuth === 'true' && authTime) {
      const timeDiff = Date.now() - parseInt(authTime);
      const sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
      
      if (timeDiff < sessionTimeout) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminAuthTime');
      }
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="max-w-md w-full space-y-4 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
            <p className="text-gray-600 mt-2">Enter your admin credentials</p>
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              disabled={isLocked}
            />
            
            {loginAttempts > 0 && (
              <p className="text-red-600 text-sm mt-1">
                {3 - loginAttempts} attempts remaining
              </p>
            )}
            
            {isLocked && (
              <p className="text-red-600 text-sm mt-1">
                Account locked. Please wait 5 minutes.
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLocked 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500'
            }`}
          >
            {isLocked ? 'Account Locked' : 'Login'}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Session expires after 2 hours of inactivity
            </p>
          </div>
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
