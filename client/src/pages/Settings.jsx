import React, { useState } from "react";
import "./Settings.css"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { current } from "@reduxjs/toolkit";

const Settings = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSaveGeneral = () => {
    alert("Profile updated!");
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5001/settings",
        {
          currentPassword,
          confirmPassword,
        },
        {
          withCredentials:true,
        }
      );

      alert("Password updated successfully!");

    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to update password.");

    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`settings-container ${isDarkMode ? "dark" : ""}`}>
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <h1 className="settings-title">Settings</h1>

      {/* General Info */}
      <div className="section">
        <h2 className="section-title">General</h2>
        <div className="upload-section">
          <label className="form-label">Your Profile Picture</label>
          <label htmlFor="upload-photo" className="upload-photo-label">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="uploaded-image" />
            ) : (
              <div className="upload-placeholder">Upload your photo</div>
            )}
          </label>
          <input
            id="upload-photo"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First name</label>
              <input
                type="text"
                placeholder="Please enter your full name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label className="form-label">Last name</label>
              <input
                type="text"
                placeholder="Please enter your username"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="button-wrapper">
            <button className="save-button" onClick={handleSaveGeneral}>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Password */}
      <div className="section">
        <h2 className="section-title">Change Password</h2>
        <div className="form-card">
        <div className="form-row">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              </div>
            </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="button-wrapper">
            <button className="save-button" onClick={handlePasswordChange}>
              Update Password
            </button>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Theme */}
      <div className="section">
        <h2 className="section-title">Display</h2>
        <div className="form-card">
          <div className="form-row">
            <div className="form-group full-width">
              <label className="form-label">Theme</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="darkModeToggle"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <label htmlFor="darkModeToggle" className="toggle-label">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
