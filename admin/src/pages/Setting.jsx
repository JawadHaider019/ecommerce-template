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
  faEyeSlash,
  faBuilding,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faUpload,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Setting = ({ setToken, token }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general"); // "general", "business", "security"

  // Existing settings state
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

  const [emailPassword, setEmailPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Business details state (frontend only - no backend dependency)
  const [businessDetails, setBusinessDetails] = useState({
    businessName: "Natura Bliss",
    email: "naturabliss@gmail.com",
    phone: "+92-333-3333",
    address: "123 Natural Street, Green Valley, PK",
    description: "Pure, handmade natural skincare products crafted with organic ingredients for your wellness.",
    businessHours: "Mon - Sat: 9:00 AM - 6:00 PM",
    socialMedia: {
      facebook: "",
      instagram: "",
      tiktok: "",
      whatsapp: ""
    }
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [savingBusiness, setSavingBusiness] = useState(false);

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
          headers: { token },
        });

        setSettings({
          email: data?.email || "",
          notifications: data?.notifications ?? true,
        });
      } catch (error) {
        console.error("Fetch settings failed:", error);
        toast.error(error.response?.data?.message || "⚠️ Failed to load settings");
        
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

  // ✅ Handle business details change
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setBusinessDetails(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview("");
  };

  // ✅ Save general settings (like notifications)
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${backendUrl}/api/settings`,
        { notifications: settings.notifications },
        { headers: { token } }
      );
      toast.success("✅ Settings saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error.response?.data?.message || "⚠️ Error saving settings");
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setToken("");
        navigate("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  // ✅ Save business details (frontend only - localStorage)
  const handleSaveBusiness = () => {
    setSavingBusiness(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Save to localStorage for persistence
      localStorage.setItem('businessDetails', JSON.stringify(businessDetails));
      if (logoPreview) {
        localStorage.setItem('businessLogo', logoPreview);
      }
      
      toast.success("✅ Business details saved successfully!");
      setSavingBusiness(false);
    }, 1000);
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
          headers: { token },
        }
      );

      toast.success(data.message || "🔑 Password updated successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      setToken("");
      navigate("/login");
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error(error.response?.data?.message || "Error changing password");
      
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
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || "📧 Email updated successfully!");
        setEmailPassword("");
        setToken("");
        navigate("/login");
      } else {
        toast.error(data.message || "⚠️ Failed to update email");
      }
    } catch (error) {
      console.error("Email change failed:", error);
      toast.error(error.response?.data?.message || "Error changing email");
      
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

  const tabs = [
    {
      id: "general",
      label: "General Settings",
      icon: faGlobe,
      description: "Manage admin email and notifications"
    },
    {
      id: "business",
      label: "Business Details",
      icon: faBuilding,
      description: "Update business information and logo"
    },
    {
      id: "security",
      label: "Security",
      icon: faLock,
      description: "Change password and security settings"
    }
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-8xl mx-auto p-2">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 bg-white p-6">
            <div className="sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faUserCog} className="text-2xl text-black" />
                <h1 className="text-2xl font-bold">Settings</h1>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-black text-white border "
                          : "text-gray-700 hover:bg-gray-50 text-black border border-gray-300"
                      }`}
                    >
                      <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{tab.label}</div>
                        <div className={`text-xs ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                      <span className={`text-xs transition-transform ${
                        isActive ? "rotate-90 text-white" : "text-gray-400"
                      }`}>
                        ▶
                      </span>
                    </button>
                  );
                })}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 border border-red-300"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Logout</div>
                    <div className="text-xs text-red-600">Sign out from your account</div>
                  </div>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-50">
            {currentTab && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentTab.label}
                  </h1>
                  <p className="text-gray-600 mt-1">{currentTab.description}</p>
                </div>

                {/* General Settings Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Admin Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Email
                          </label>  
                          <input
                            type="email"
                            name="email"
                            value={settings.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type={passwordVisibility.emailPassword ? "text" : "password"}
                            placeholder="Enter password to confirm email change"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
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
                          className="bg-black text-white px-6 py-2 rounded-lg disabled:opacity-70"
                        >
                          {changingEmail ? "Updating..." : "Change Email"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Notifications
                      </h3>
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
                        <span className="text-gray-700">Enable Email Notifications</span>
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg disabled:opacity-70"
                      >
                        <FontAwesomeIcon icon={faSave} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Business Details Tab */}
                {activeTab === "business" && <BusinessDetailsContent 
                  businessDetails={businessDetails}
                  handleBusinessChange={handleBusinessChange}
                  handleSocialMediaChange={handleSocialMediaChange}
                  handleLogoChange={handleLogoChange}
                  removeLogo={removeLogo}
                  logoPreview={logoPreview}
                  handleSaveBusiness={handleSaveBusiness}
                  savingBusiness={savingBusiness}
                />}

                {/* Security Tab */}
                {activeTab === "security" && <SecurityContent 
                  passwords={passwords}
                  handlePasswordChange={handlePasswordChange}
                  passwordVisibility={passwordVisibility}
                  togglePasswordVisibility={togglePasswordVisibility}
                  handleChangePassword={handleChangePassword}
                />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Business Details Component
const BusinessDetailsContent = ({
  businessDetails,
  handleBusinessChange,
  handleSocialMediaChange,
  handleLogoChange,
  removeLogo,
  logoPreview,
  handleSaveBusiness,
  savingBusiness
}) => {
  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Business Logo"
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="text-2xl text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Business Logo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Recommended: Square image, at least 200×200px, PNG or JPG format
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <input
                type="file"
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-800 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUpload} />
                Upload New
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Business Name", name: "businessName", icon: faBuilding, required: true },
            { label: "Email", name: "email", icon: faEnvelope, required: true },
            { label: "Phone", name: "phone", icon: faPhone, required: true },
            { label: "Business Hours", name: "businessHours", icon: faClock, required: false },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={field.icon} className="mr-2 text-gray-500" />
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name={field.name}
                value={businessDetails[field.name]}
                onChange={handleBusinessChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required={field.required}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" />
          Address
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={businessDetails.address}
            onChange={handleBusinessChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Business Description
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={businessDetails.description}
            onChange={handleBusinessChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Social Media Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Facebook", name: "facebook" },
            { label: "Instagram", name: "instagram" },
            { label: "TikTok", name: "tiktok" },
            { label: "WhatsApp", name: "whatsapp" },
          ].map((social, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {social.label}
              </label>
              <input
                type="url"
                name={social.name}
                value={businessDetails.socialMedia[social.name]}
                onChange={handleSocialMediaChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={`https://${social.name.toLowerCase()}.com/yourpage`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveBusiness}
          disabled={savingBusiness}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg disabled:opacity-70"
        >
          <FontAwesomeIcon icon={faSave} />
          {savingBusiness ? "Saving..." : "Save Business Details"}
        </button>
      </div>
    </div>
  );
};

// Security Component
const SecurityContent = ({
  passwords,
  handlePasswordChange,
  passwordVisibility,
  togglePasswordVisibility,
  handleChangePassword
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          {[
            { label: "Current Password", name: "oldPassword" },
            { label: "New Password", name: "newPassword" },
            { label: "Confirm New Password", name: "confirmPassword" },
          ].map((field, index) => (
            <div key={index} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} <span className="text-red-500">*</span>
              </label>
              <input
                type={passwordVisibility[field.name] ? "text" : "password"}
                name={field.name}
                placeholder={field.label}
                value={passwords[field.name]}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
                onClick={() => togglePasswordVisibility(field.name)}
              >
                <FontAwesomeIcon 
                  icon={passwordVisibility[field.name] ? faEyeSlash : faEye} 
                  className="text-gray-500"
                />
              </button>
            </div>
          ))}
          
          <button
            onClick={handleChangePassword}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 w-full md:w-auto"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;