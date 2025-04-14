/*import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";

const Settings = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle name update
  const handleNameUpdate = async () => {
    try {
      const response = await axios.put("http://localhost:5001/user/update-name", {
        firstName,
        lastName,
      });
      alert("Name updated successfully!");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    }
  };

  // Function to handle password update
  const handlePasswordUpdate = async () => {
    try {
      const response = await axios.put("http://localhost:5001/user/update-password", {
        currentPassword,
        newPassword,
      });
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Settings</h2>
*/
        {/* Update Name Section */}
       /* <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Update Name</h3>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handleNameUpdate}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Name
          </button>
        </div>*/

        {/* Update Password Section */}
        /*<div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Change Password</h3>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handlePasswordUpdate}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Password
          </button>
        </div>*/

        {/* Modal Example */}
       /* <div className="text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-500 underline"
          >
            Open Modal Example
          </button>
        </div>*/

        {/* Headless UI Modal */}
        /*<Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Modal Example
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This is an example of a modal using Headless UI.
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Settings; */
import React, { useState } from "react";
import "./css/Settings.css"; 

const Settings = () => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = () => {
    alert("Changes saved successfully!");
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <div className="profile-settings">
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

            <hr className="divider" />

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
                <button className="save-button" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case "Update Password":
        return (
          <div className="form-card">
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
        );

      case "Display":
        return (
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
        );

      default:
        return (
          <div className="coming-soon">
            <p>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={`settings-container ${isDarkMode ? "dark" : ""}`}>
      <h1 className="settings-title">Settings</h1>
      <div className="tabs">
        {["Profile", "Notification", "Update Password", "Display"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default Settings;
