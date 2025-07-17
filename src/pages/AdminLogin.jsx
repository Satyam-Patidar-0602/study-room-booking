import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem('admin_logged_in', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        </div>
        <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin; 