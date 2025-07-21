import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const ADMIN_USER = 'StudyPoint';
const ADMIN_PASS = 'study@0723';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-blue-50 to-purple-100">
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 relative">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-gray-500 text-sm mt-1">Restricted access</p>
        </div>
        {error && <div className="mb-4 text-red-600 text-center text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-700">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" required autoFocus autoComplete="username" />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" required autoComplete="current-password" />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-primary-700 transition-all">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 