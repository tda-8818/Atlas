import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUploadProfilePicMutation,
  useUpdateProfileMutation,
} from "../redux/slices/userSlice";
import axios from "axios";

const Settings = ({ setTheme }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [uploadProfilePic] = useUploadProfilePicMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result); // Sets preview URL for UI
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleProfilePictureChange = async () => {
    try {
      if (!profileImageFile) {
        alert("No profile image selected!");
        return;
      }
      
      const formData = new FormData();
      formData.append("profilePic", profileImageFile);  // Ensure this key matches the backend field name
  
      // Trigger the upload API call
      await uploadProfilePic(formData).unwrap();
      
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Profile picture update failed:", error);
      alert("Failed to update profile picture.");
    }
  };
  
  

  const handleNameEmailChange = async () => {
    try {
      const updatedData = { firstName, lastName, email };
      await updateProfile(updatedData).unwrap();
      alert("Name and email updated!");
    } catch (error) {
      console.error("Profile info update failed:", error);
      alert("Failed to update name or email.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5001/settings",
        {
          currentPassword,
          confirmPassword,
        },
        { withCredentials: true }
      );
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to update password.");
    }
  };

  return (
    <div className="p-8 bg-[var(--background-primary)] min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="bg-[var(--background)] text-[var(--text)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--background-secondary)] transition-all"
        >
          ← Back to Home
        </button>
      </div>

      <h1 className="text-[2rem] font-bold text-[var(--text)] mb-8">Settings</h1>

      <div className="bg-[var(--background)] rounded-2xl p-6 mb-12 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">General</h2>

        <div className="flex flex-col gap-6">
          <div>
            <label className="text-[0.9rem] text-gray-500 mb-2 block">Your Profile Picture</label>
            <label
              htmlFor="upload-photo"
              className="w-[120px] h-[120px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer bg-[var(--background-primary)] text-[var(--text)]"
            >
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-[0.9rem] text-gray-400 text-center">Upload your photo</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.9rem] text-gray-500 mb-2 block">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full p-3 rounded-lg bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color)]"
              />
            </div>
            <div>
              <label className="text-[0.9rem] text-gray-500 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full p-3 rounded-lg bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color)]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[0.9rem] text-gray-500 mb-2 block">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full p-3 rounded-lg bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color)]"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleProfilePictureChange}
              className="bg-[#187cb4] hover:bg-[#12547a] text-white py-3 px-6 text-sm font-medium rounded-lg"
            >
              Save Profile Picture
            </button>
            <button
              onClick={handleNameEmailChange}
              className="bg-[#187cb4] hover:bg-[#12547a] text-white py-3 px-6 text-sm font-medium rounded-lg"
            >
              Save Name & Email
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--background)] rounded-2xl p-6 mb-12 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Change Password</h2>

        <div className="flex flex-col gap-6">
          <div>
            <label className="text-[0.9rem] text-gray-500 mb-2 block">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full p-3 rounded-lg bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.9rem] text-gray-500 mb-2 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-3 rounded-lg bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color)]"
              />
            </div>
            <div>
              <label className="text-[0.9rem] text-gray-500 mb-2 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-3 rounded-lg bg-[var(--background-primary)] text-[var(--text)] border border-[var(--border-color)]"
              />
            </div>
          </div>

          <div>
            <button
              onClick={handlePasswordChange}
              className="mt-2 bg-[#187cb4] hover:bg-[#12547a] text-white py-3 px-6 text-sm font-medium rounded-lg cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--background)] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Display</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setTheme("light")}
            className="px-6 py-3 rounded-xl bg-white text-black shadow-md hover:shadow-lg transition"
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className="px-6 py-3 rounded-xl bg-[#1e1e1e] text-white shadow-md hover:shadow-lg transition"
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
