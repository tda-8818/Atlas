import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUploadProfilePicMutation,
  useUpdateProfileMutation,
  useGetCurrentUserQuery
} from "../redux/slices/userSlice";
import axios from "axios";
import { showErrorToast } from '../components/errorToast.jsx';
import toast from 'react-hot-toast';

const Settings = ({ setTheme }) => {
  const navigate = useNavigate();
  
  // Add this line to fetch the current user data
  const { data: userData, isLoading } = useGetCurrentUserQuery();
  
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

  // Add useEffect to load user data when component mounts
  useEffect(() => {
    if (userData && userData.user) {
      setFirstName(userData.user.firstName || "");
      setLastName(userData.user.lastName || "");
      setEmail(userData.user.email || "");
      
      // Set profile picture if available
      if (userData.user.profilePic) {
        setProfileImagePreview(userData.user.profilePic);
      }
    }
  }, [userData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size exceeds 5MB limit", "400");
        return;
      }
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
      formData.append("profilePic", profileImageFile);
      
      // Trigger the upload API call
      const result = await uploadProfilePic(formData).unwrap();
      console.log("Upload success:", result);
      
      // If the server returns the updated user info with profile pic URL
      if (result.user && result.user.profilePic) {
        // Here you could update the profile picture in your app state if needed
        console.log("New profile picture URL:", result.user.profilePic);
        setProfileImagePreview(result.user.profilePic);
      }
      
      alert("Profile picture updated successfully!");
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

  const handleSaveGeneral = async () => {
    try {
      // Validate input
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        showErrorToast("Please fill all required fields", "400");
        return;
      }
      
      // Email validation
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        showErrorToast("Please enter a valid email address", "400");
        return;
      }
      
      // Mock API call for now
      // await axios.put('/api/settings/profile', {
      //   firstName,
      //   lastName,
      //   email
      // }, { withCredentials: true });
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to update profile", 
        error.response?.status || "400"
      );
    }
  };

  const handlePasswordChange = async () => {
    try {
      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        showErrorToast("Please fill all password fields", "400");
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showErrorToast("Passwords do not match", "400");
        return;
      }
      
      // Password strength validation
      if (newPassword.length < 8) {
        showErrorToast("Password must be at least 8 characters long", "400");
        return;
      }

      // API call
      try {
        await axios.put(
          "http://localhost:5001/settings",
          {
            currentPassword,
            confirmPassword,
          },
          {
            withCredentials: true,
          }
        );
        toast.success("Password updated successfully!");
        
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Password update error:", error);
        
        if (error.response?.status === 401) {
          showErrorToast("Current password is incorrect", "401");
        } else {
          showErrorToast(
            error.response?.data?.message || "Failed to update password", 
            error.response?.status || "400"
          );
        }
      }
    } catch (error) {
      showErrorToast("An unexpected error occurred", "500");
    }
  };

  return (
    <div className="p-8 bg-[var(--background-primary)] min-h-screen">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500">Loading user data...</p>
        </div>
      ) : (
        <>
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

      {/* Theme Selection */}
      <div className="bg-[var(--background)] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Display</h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setTheme("light");
              toast.success("Theme updated to light mode");
            }}
            className="px-6 py-3 rounded-xl bg-white text-black shadow-md hover:shadow-lg transition"
          >
            Light
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              toast.success("Theme updated to dark mode");
            }}
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