import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth.js';

const AdminSignup = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    adminSecret: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111827] text-white " +
    "placeholder-white/50 border border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const handleImageSelect = (file) => {
    if (!file) return;
    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!profileFile) {
      return setError('Profile image is required');
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('password', form.password);
      formData.append('adminSecret', form.adminSecret);
      formData.append('profileImage', profileFile);

      const res = await axios.post(
        `${BASE_URL}/api/auth/admin/signup`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setIsAuthenticated(true);
      setUser(res.data.user);
      setMessage(res.data.msg);

      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl
        bg-[#0F172A]/90 backdrop-blur-2xl
        border border-white/10 shadow-xl">

        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Admin Signup
        </h2>

        {message && <p className="text-green-400 text-center mb-3">{message}</p>}
        {error && <p className="text-red-400 text-center mb-3">{error}</p>}

        {/* PROFILE IMAGE */}
        <div className="flex justify-center mb-4">
          <label className="w-24 h-24 rounded-full border border-white/20
            flex items-center justify-center cursor-pointer overflow-hidden">
            {profileImage ? (
              <img src={profileImage} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/50 text-sm">Add Photo</span>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageSelect(e.target.files[0])}
            />
          </label>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Admin Username (Email)"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={inputBase}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputBase}
          />

          <input
            type="password"
            placeholder="Admin Secret Key"
            value={form.adminSecret}
            onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
            className={inputBase}
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white
              bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Admin...' : 'Create Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
