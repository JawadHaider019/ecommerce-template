import React, { useState, useEffect } from "react"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCog,
  faBell,
  faSave,
  faLock,
  faSignOutAlt,
  faGlobe,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Setting = ({ setToken, token }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    email: "",
    notifications: true,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
    emailPassword: false,
  });

  const [emailPassword, setEmailPassword] = useState(""); // password for email change
  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // ✅ Fetch current settings (email, notifications) from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/settings`, {
          headers: { token }, // Changed to match Orders component
        });

        setSettings({
          email: data?.email || "",
          notifications: data?.notifications ?? true,
        });
      } catch (error) {
        console.error("Fetch settings failed:", error);
        toast.error(error.response?.data?.message || "⚠️ Failed to load settings");
        
        // If authentication fails, redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
          setToken("");
          navigate("/login");
        }
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [token]);

  // ✅ Handle settings input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Save general settings (like notifications)
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${backendUrl}/api/settings`,
        { notifications: settings.notifications },
        { headers: { token } } // Changed to match Orders component
      );
      toast.success("✅ Settings saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error.response?.data?.message || "⚠️ Error saving settings");
      
      // If authentication fails, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        setToken("");
        navigate("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  // ✅ Change admin password
  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error("❌ Please fill in all password fields.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("❌ New passwords do not match!");
      return;
    }

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/settings/change-password`,
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { token }, // Changed to match Orders component
        }
      );

      toast.success(data.message || "🔑 Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      // Redirect to login after password change
      setToken("");
      navigate("/login");
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error(error.response?.data?.message || "Error changing password");
      
      // If authentication fails, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        setToken("");
        navigate("/login");
      }
    }
  };

  // ✅ Change admin email (with password verification)
  const handleChangeEmail = async () => {
    if (!settings.email) {
      toast.error("❌ Email cannot be empty.");
      return;
    }

    if (!emailPassword) {
      toast.error("❌ Please enter your password to change email.");
      return;
    }

    try {
      setChangingEmail(true);
      const { data } = await axios.put(
        `${backendUrl}/api/settings/change-email`,
        { email: settings.email, password: emailPassword },
        { headers: { token } } // Changed to match Orders component
      );

      if (data.success) {
        toast.success(data.message || "📧 Email updated successfully!");
        setEmailPassword("");

        // Redirect to login after email change
        setToken("");
        navigate("/login");
        
        // Refresh email from backend
        const refreshed = await axios.get(`${backendUrl}/api/settings`, {
          headers: { token }, // Changed to match Orders component
        });
        setSettings((prev) => ({
          ...prev,
          email: refreshed.data?.email || prev.email,
        }));
      } else {
        toast.error(data.message || "⚠️ Failed to update email");
      }
    } catch (error) {
      console.error("Email change failed:", error);
      toast.error(error.response?.data?.message || "Error changing email");
      
      // If authentication fails, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        setToken("");
        navigate("/login");
      }
    } finally {
      setChangingEmail(false);
    }
  };

  // ✅ Handle logout
  const handleLogout = () => {
    setToken("");
    navigate("/login");
  };

  // ✅ Loading state
  if (loadingSettings) {
    return <div className="p-6 text-center">⏳ Loading settings...</div>;
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8 space-y-8 md:space-y-12">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <FontAwesomeIcon icon={faUserCog} className="text-xl md:text-2xl text-black" />
          <h1 className="text-xl md:text-2xl font-bold">Admin Panel Settings</h1>
        </div>

        {/* General Information */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 border-b pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className="text-sm md:text-base" />
            General Information
          </h2>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>  
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={(e)=>handleChange(e)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
            />
            <div className="relative">
              <input
                type={passwordVisibility.emailPassword ? "text" : "password"}
                placeholder="Enter password to confirm"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility("emailPassword")}
              >
                <FontAwesomeIcon 
                  icon={passwordVisibility.emailPassword ? faEyeSlash : faEye} 
                  className="text-gray-500"
                />
              </button>
            </div>
            <button
              onClick={handleChangeEmail}
              disabled={changingEmail}
              className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-70 w-full md:w-auto"
            >
              {changingEmail ? "Updating..." : "Change Email"}
            </button>
          </div>
        </section>
        

        {/* Notifications */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 border-b pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faBell} className="text-yellow-500 text-sm md:text-base" />
            Notifications
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="sr-only"
            />
            <div
              className={`w-14 h-7 rounded-full ${
                settings.notifications ? "bg-black" : "bg-gray-300"
              } relative`}
            >
              <div
                className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition transform ${
                  settings.notifications ? "translate-x-7" : ""
                }`}
              />
            </div>
            <span className="text-gray-700 text-sm md:text-base">Enable Email Notifications</span>
          </label>
        </section>

        {/* Change Password */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 border-b pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="text-red-500 text-sm md:text-base" />
            Change Password
          </h2>
          <div className="space-y-4 md:space-y-5">
            <div className="relative">
              <input
                type={passwordVisibility.oldPassword ? "text" : "password"}
                name="oldPassword"
                placeholder="Current Password"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility("oldPassword")}
              >
                <FontAwesomeIcon 
                  icon={passwordVisibility.oldPassword ? faEyeSlash : faEye} 
                  className="text-gray-500"
                />
              </button>
            </div>
            
            <div className="relative">
              <input
                type={passwordVisibility.newPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility("newPassword")}
              >
                <FontAwesomeIcon 
                  icon={passwordVisibility.newPassword ? faEyeSlash : faEye} 
                  className="text-gray-500"
                />
              </button>
            </div>
            
            <div className="relative">
              <input
                type={passwordVisibility.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                <FontAwesomeIcon 
                  icon={passwordVisibility.confirmPassword ? faEyeSlash : faEye} 
                  className="text-gray-500"
                />
              </button>
            </div>
            
            <button
              onClick={handleChangePassword}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 w-full md:w-auto"
            >
              Update Password
            </button>
          </div>
        </section>

        {/* Save + Logout */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg disabled:opacity-70 w-full md:w-auto justify-center"
          >
            <FontAwesomeIcon icon={faSave} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 w-full md:w-auto justify-center"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;