import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config';

const AdminCreateForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/create-admin`,
        formData,
        {
          headers: {
            'x-admin-secret': ADMIN_SECRET,
            'Content-Type': 'application/json',
          },
          withCredentials: true, // ✅ Include cookies
        }
      );

      setMessage(response.data.msg);
      setFormData({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
      });

    } catch (err) {
      console.error("Create Admin Error:", err.response?.data);
      setError(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="fixed top-0 bg-white w-full h-screen z-50 overflow-auto">
      <div className="min-h-screen bg-white flex items-center justify-center p-4 dark:bg-gray-900">
        <div className="w-full max-w-md bg-gray-300 rounded-lg shadow-2xl p-6 space-y-10 dark:bg-gray-800">
          <h2 className="text-3xl font-semibold text-center underline">
            Create Admin Account
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-10">
            <input
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="w-full h-12 p-2 rounded-lg border border-black shadow dark:bg-gray-700"
            />
            <input
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="w-full h-12 p-2 rounded-lg border border-black shadow dark:bg-gray-700"
            />
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full h-12 p-2 rounded-lg border border-black shadow dark:bg-gray-700"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full h-12 p-2 rounded-lg border border-black shadow dark:bg-gray-700"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full h-12 p-2 rounded-lg border border-black shadow dark:bg-gray-700"
            />
            <button
              type="submit"
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 rounded-lg shadow border border-black"
            >
              Create Admin
            </button>
          </form>

          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminCreateForm;
