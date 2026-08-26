import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateProfilePicMutation,
  useGetCurrentUserQuery,
  useUpdatePasswordMutation,
  useUpdateMeMutation,
  useResendVerificationEmailMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation
} from "../redux/slices/userSlice";
import { showErrorToast } from "../components/errorToast";
import toast from "react-hot-toast";
import PageLayout from "../layouts/PageLayout";
import { MdVerified, MdWarning, MdEdit, MdCheck, MdArrowBack } from "react-icons/md";

const Settings = ({ setTheme }) => {
  const navigate = useNavigate();

  const { data: userData, isLoading, refetch } = useGetCurrentUserQuery();
  const [updateProfilePic, { isLoading: isUpdatingPic }] = useUpdateProfilePicMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateMeMutation();
  const [updatePasswordMutation, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [resendVerificationEmail, { isLoading: isResendingVerification }] = useResendVerificationEmailMutation();
  const { data: apiKeys = [], isLoading: isLoadingKeys } = useGetApiKeysQuery();
  const [createApiKey, { isLoading: isCreatingKey }] = useCreateApiKeyMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Track if profile form has changed
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasPasswordChanges, setHasPasswordChanges] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Load user data
  useEffect(() => {
    if (userData && userData.user) {
      setFirstName(userData.user.firstName || "");
      setLastName(userData.user.lastName || "");
      setEmail(userData.user.email || "");

      if (userData.user.profilePic) {
        setProfileImagePreview(userData.user.profilePic);
      }
    }
  }, [userData]);

  // Track changes for save button
  useEffect(() => {
    if (userData?.user) {
      const changed =
        firstName !== (userData.user.firstName || "") ||
        lastName !== (userData.user.lastName || "") ||
        (email !== (userData.user.email || "") && !userData.user.emailVerified);
      setHasProfileChanges(changed);
    }
  }, [firstName, lastName, email, userData]);

  useEffect(() => {
    const changed = currentPassword || newPassword || confirmPassword;
    setHasPasswordChanges(!!changed);
  }, [currentPassword, newPassword, confirmPassword]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureChange = async () => {
    try {
      if (!profileImageFile) {
        toast.error("No profile image selected!");
        return;
      }

      const formData = new FormData();
      formData.append("profilePic", profileImageFile);

      const result = await updateProfilePic(formData).unwrap();

      if (result.user && result.user.profilePic) {
        setProfileImagePreview(result.user.profilePic);
      }

      setProfileImageFile(null);
      toast.success("Profile picture updated successfully!");
      refetch();
    } catch (error) {
      console.error("Profile picture update failed:", error);
      toast.error(error?.data?.message || "Failed to update profile picture.");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedData = { firstName, lastName };

      // Only include email if it's not verified (allow changes)
      if (!userData?.user?.emailVerified) {
        updatedData.email = email;
      }

      const result = await updateUser(updatedData).unwrap();
      toast.success('Profile updated successfully!');

      if (result?.user) {
        setFirstName(result.user.firstName || "");
        setLastName(result.user.lastName || "");
        setEmail(result.user.email || "");
      }

      setHasProfileChanges(false);
      refetch();
    } catch (err) {
      console.error('Profile update failed:', err);
      toast.error(err?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {
      const result = await updatePasswordMutation({ currentPassword, confirmPassword }).unwrap();
      toast.success(result?.message || "Password updated successfully!");

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHasPasswordChanges(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update password.");
    }
  };

  const handleResendVerification = async () => {
    try {
      const result = await resendVerificationEmail().unwrap();
      toast.success(result.message || 'Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend verification failed:', err);
      toast.error(err?.data?.message || 'Failed to send verification email.');
    }
  };

  const handleCreateApiKey = async () => {
    const name = newKeyName.trim();
    if (!name) {
      toast.error('Give this key a name, e.g. Cursor MCP.');
      return;
    }
    try {
      const result = await createApiKey({ name }).unwrap();
      setCreatedKey(result);
      setNewKeyName('');
      setCopiedKey(false);
      toast.success('API key created. Copy it now.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create API key.');
    }
  };

  const handleCopyApiKey = async () => {
    if (!createdKey?.key) return;
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopiedKey(true);
      toast.success('API key copied.');
    } catch (err) {
      toast.error('Could not copy key. Select it and copy manually.');
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    if (!window.confirm('Revoke this API key? Cursor and Claude will stop working until you create a new one.')) {
      return;
    }
    try {
      await revokeApiKey(keyId).unwrap();
      if (createdKey?.id === keyId) setCreatedKey(null);
      toast.success('API key revoked.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to revoke API key.');
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Settings">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            <p className="text-[var(--text-muted)]">Loading settings...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Settings">
      <div className="max-w-4xl mx-auto">

        {/* Profile Section */}
        <div className="bg-[var(--background)] rounded-2xl border border-[var(--border-color)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Profile</h2>

          {/* Profile Picture */}
          <div className="flex items-start gap-6 mb-6 pb-6 border-b border-[var(--border-color)]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-md">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-3xl font-bold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="upload-photo">
                <input
                  id="upload-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="inline-block px-4 py-2 bg-[var(--background-secondary)] hover:bg-[var(--background-primary)] border border-[var(--border-color)] text-[var(--text)] text-sm font-medium rounded-lg cursor-pointer transition-colors">
                  Choose Photo
                </span>
              </label>

              {profileImageFile && (
                <button
                  onClick={handleProfilePictureChange}
                  disabled={isUpdatingPic}
                  className="ml-3 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUpdatingPic ? 'Uploading...' : 'Upload'}
                </button>
              )}

              <p className="text-xs text-[var(--text-muted)] mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>
          </div>

          {/* Email Field with Verification Badge */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={userData?.user?.emailVerified}
                placeholder="Enter email"
                className={`w-full px-4 py-2.5 pr-32 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)] ${
                  userData?.user?.emailVerified ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              />

              {/* Verification Badge */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {userData?.user?.emailVerified ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                    <MdVerified className="text-green-500 text-sm" />
                    <span className="text-xs font-medium text-green-600">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                      <MdWarning className="text-yellow-500 text-sm" />
                      <span className="text-xs font-medium text-yellow-600">Unverified</span>
                    </div>
                    <button
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="text-xs font-medium text-[var(--color-primary)] hover:underline disabled:opacity-50"
                    >
                      {isResendingVerification ? 'Sending...' : 'Resend'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!userData?.user?.emailVerified && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Please verify your email to enable all collaboration features.
              </p>
            )}

            {userData?.user?.emailVerified && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Your email is verified and cannot be changed. Contact support to update.
              </p>
            )}
          </div>

          {/* Save Button */}
          {hasProfileChanges && (
            <div className="pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleUpdateProfile}
                disabled={isUpdatingUser}
                className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdatingUser ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <MdCheck className="text-lg" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-[var(--background)] rounded-2xl border border-[var(--border-color)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Password</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>
          </div>

          {hasPasswordChanges && (
            <div className="pt-4 border-t border-[var(--border-color)] mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={isUpdatingPassword}
                className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <MdCheck className="text-lg" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="bg-[var(--background)] rounded-2xl border border-[var(--border-color)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2">API keys</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Use a key with Cursor or Claude MCP. The full key is shown only once.
          </p>

          {createdKey?.key && (
            <div className="mb-6 p-4 rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5">
              <p className="text-sm font-medium text-[var(--text)] mb-2">
                Copy this key now. You will not see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs break-all bg-[var(--background-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--text)]">
                  {createdKey.key}
                </code>
                <button
                  onClick={handleCopyApiKey}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] hover:bg-[var(--background-primary)] text-[var(--text)]"
                >
                  {copiedKey ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name, e.g. Cursor MCP"
              className="flex-1 px-4 py-2.5 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button
              onClick={handleCreateApiKey}
              disabled={isCreatingKey}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCreatingKey ? 'Creating...' : 'Create key'}
            </button>
          </div>

          {isLoadingKeys ? (
            <p className="text-sm text-[var(--text-muted)]">Loading keys...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No API keys yet.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key._id}
                  className="flex items-center justify-between gap-4 p-3 bg-[var(--background-primary)] border border-[var(--border-color)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{key.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {key.prefix}… · created {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : ''}
                      {key.lastUsedAt ? ` · last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : ' · never used'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeApiKey(key._id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Section */}
        <div className="bg-[var(--background)] rounded-2xl border border-[var(--border-color)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Appearance</h2>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => setTheme("light")}
              className="relative px-6 py-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[var(--color-primary)] transition-all group"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MdCheck className="text-[var(--color-primary)]" />
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300"></div>
                <span className="text-sm font-medium text-gray-900">Light</span>
              </div>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className="relative px-6 py-4 rounded-xl bg-[#1e1e1e] border-2 border-gray-700 hover:border-[var(--color-primary)] transition-all group"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MdCheck className="text-[var(--color-primary)]" />
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600"></div>
                <span className="text-sm font-medium text-white">Dark</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
