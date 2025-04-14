import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './css/Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
  });

  const [responseMsg, setResponseMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put('http://localhost:5001/api/users/edit', formData);
      setResponseMsg(res.data.message);
    } catch (err) {
      setResponseMsg(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="settings-page">
      <Navbar />
      <h2>User Settings</h2>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </label>

        <label>
          Current Password:
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </label>

        <label>
          New Password:
          <input 
            type="password" 
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required 
          />
        </label>

        <button type="submit">Update Password</button>
      </form>

      {responseMsg && <p className="response-message">{responseMsg}</p>}
    </div>
  );
};

export default Settings;
