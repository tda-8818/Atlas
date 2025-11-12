import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateProfilePicMutation,
  useGetCurrentUserQuery,
  useUpdatePasswordMutation,
  useUpdateMeMutation,
  useResendVerificationEmailMutation
} from "../redux/slices/userSlice";
import { showErrorToast } from "../components/errorToast";
import toast from "react-hot-toast";

const Settings = ({ setTheme }) => {
  const navigate = useNavigate();
  
  const { data: userData, isLoading } = useGetCurrentUserQuery();
  const [updateProfilePic, { isLoading: isUpdatingPic }] = useUpdateProfilePicMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateMeMutation(); // Destructure loading state for name/email
  const [updatePasswordMutation, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [resendVerificationEmail, { isLoading: isResendingVerification }] = useResendVerificationEmailMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

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
        toast.warn("No profile image selected!");
        return;
      }

      const formData = new FormData();
      formData.append("profilePic", profileImageFile);

      const result = await updateProfilePic(formData).unwrap(); // Correct function call
      console.log("Upload success:", result);

      if (result.user && result.user.profilePic) {
        console.log("New profile picture URL:", result.user.profilePic);
        setProfileImagePreview(result.user.profilePic);
      }

      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Profile picture update failed:", error);
      toast.error(error?.data?.message || "Failed to update profile picture.");
    }
  };


  const handleUpdateNameAndEmail = async () => {
    try {
      const updatedData = { firstName, lastName, email };
      const result = await updateUser(updatedData).unwrap(); // Correct function call
      toast.success('Name and email updated successfully!');
      if (result?.user) {
        setFirstName(result.user.firstName || "");
        setLastName(result.user.lastName || "");
        setEmail(result.user.email || "");
      }
    } catch (err) {
      console.error('Name and email update failed:', err);
      toast.error(err?.data?.message || 'Failed to update name and email.');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match!");
      return;
    }

    try {
      const result = await updatePasswordMutation({ currentPassword, confirmPassword }).unwrap();
      if (result?.message) {
        toast(result.message); // Show success message from backend if available
      } else {
        toast("Password updated successfully!");
      }
      // Optionally clear the password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showErrorToast(err?.data?.message || "Failed to update password."); // Show error message from backend if available
    }
  };

  const handleResendVerification = async () => {
    try {
      const result = await resendVerificationEmail().unwrap();
      toast.success(result.message || 'Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend verification failed:', err);
      showErrorToast(err?.data?.message || 'Failed to send verification email.');
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
              onClick={() => navigate('/')}
              className="bg-[var(--background)] text-[var(--text)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--background-secondary)] transition-all"
            >
              ← Back to Projects
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
                  onClick={handleUpdateNameAndEmail}
                  className="bg-[#187cb4] hover:bg-[#12547a] text-white py-3 px-6 text-sm font-medium rounded-lg"
                >
                  Save Name & Email
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[var(--background)] rounded-2xl p-6 mb-12 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Email Verification</h2>

            <div className="flex items-center justify-between p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                {userData?.user?.emailVerified ? (
                  <>
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-[var(--text)] font-semibold">Email Verified</p>
                      <p className="text-sm text-gray-500">Your email address has been verified</p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-[var(--text)] font-semibold">Email Not Verified</p>
                      <p className="text-sm text-gray-500">Please verify your email to enable collaboration features</p>
                    </div>
                  </>
                )}
              </div>

              {!userData?.user?.emailVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="bg-[#187cb4] hover:bg-[#12547a] text-white py-2 px-4 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
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
        </>
      )}
    </div>
  );
};

export default Settings;