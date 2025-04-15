import React, { useState } from "react";
import "./Settings.css"; 

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
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

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
