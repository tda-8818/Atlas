import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { current } from "@reduxjs/toolkit";

const Settings = ({ setTheme }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
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

  return (
    <div className="p-8 bg-[var(--background)] min-h-screen">
      <button
        onClick={() => navigate("/")}
        className="bg-transparent border-0 text-[#4f46e5] font-medium text-[0.95rem] mb-4 cursor-pointer no-underline hover:text-[#3730a3]"
      >
        ← Back to Home
      </button>

      <h1 className="text-[2rem] text-[var(--text)] font-bold mb-8">Settings</h1>

      {/* General Info */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-[var(--text)]">General</h2>
        <div className="flex flex-col items-start gap-2">
          <label className="text-[0.9rem] text-gray-500 mb-2">
            Your Profile Picture
          </label>
          <label
            htmlFor="upload-photo"
            className="w-[120px] h-[120px] border-2 border-dashed border-gray-300 rounded-[12px] flex items-center justify-center cursor-pointer bg-[var(--background-primary)] text-[var(--text)] "
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[0.9rem] text-gray-400 text-center">
                Upload your photo
              </div>
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

        <div>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex flex-col flex-1">
              <label className="text-[0.9rem] text-gray-500 mb-2">
                First name
              </label>
              <input
                type="text"
                placeholder="Please enter your full name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-[var(--background-primary)] text-[var(--text)] p-3 rounded-lg text-base border-0"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[0.9rem] text-gray-500 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Please enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--background-primary)] text-[var(--text)] p-3 rounded-lg text-base border-0"
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex flex-col flex-1 basis-full">
              <label className="text-[0.9rem] text-gray-500 mb-2">
                Last name
              </label>
              <input
                type="text"
                placeholder="Please enter your username"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-[var(--background-primary)] text-[var(--text)] p-3 rounded-lg text-base border-0"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSaveGeneral}
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white py-3 px-8 text-base font-semibold rounded-lg cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <hr className="h-px bg-gray-200 my-8" />


      {/* Password */}
      <div className="mb-12">
        <h2 className="text-xl text-[var(--text)] font-semibold mb-6">Change Password</h2>
        <div>
          <div className="flex flex-col flex-1 mb-6">
            <label className="text-[0.9rem] text-gray-500 mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-[var(--background-primary)] text-[var(--text)] p-3 rounded-lg text-base border-0"
            />
          </div>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex flex-col flex-1">
              <label className="text-[0.9rem] text-gray-500 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[var(--background-primary)] text-[var(--text)] p-3 rounded-lg text-base border-0"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[0.9rem] text-gray-500 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[var(--background-primary)] text-[var(--text)] p-3 rounded-lg text-base border-0"
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={handlePasswordChange}
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white py-3 px-8 text-base font-semibold rounded-lg cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>


      <hr className="h-px bg-[var(--border-color)] my-8" />

      {/* Theme Selection */}
      <div className="mb-12">
        <h2 className="text-xl text-[var(--text)] font-semibold mb-6">Display</h2>
        <div className="flex w-full gap-4">
          <button
            onClick={() => setTheme("light")}
            className="w-[20vh] bg-[#f5f5f7] text-black rounded-[6%]"
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className="w-[20vh] bg-[#f5f5f7] text-black rounded-[6%]"
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;