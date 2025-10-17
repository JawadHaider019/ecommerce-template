// Banner.jsx
import React from "react";

const BannerTab = ({ index, banner, banners, setBanners, previewUrlsRef, setSelectedImage }) => {

  const handleBannerImageChange = (index, file) => {
    if (!file) return;

    const updated = [...banners];

    // Remove old preview if exists
    const old = updated[index]?.imagePreview;
    if (old) {
      URL.revokeObjectURL(old);
      previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== old);
    }

    // Create new preview
    const preview = URL.createObjectURL(file);
    previewUrlsRef.current.push(preview);

    updated[index] = {
      ...updated[index],
      imageFile: file,
      imagePreview: preview,
    };

    setBanners(updated);
  };

  const removeBannerImage = (index) => {
    const updated = [...banners];
    const old = updated[index]?.imagePreview;
    if (old) {
      URL.revokeObjectURL(old);
      previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== old);
    }

    updated[index] = {
      ...updated[index],
      imageFile: null,
      imagePreview: "",
    };

    setBanners(updated);
  };

  return (
    <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">Banner #{index + 1}</span>
        <button
          onClick={() => setBanners(banners.filter((_, i) => i !== index))}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
        >
          <i className="fas fa-trash-alt text-xs"></i> Remove
        </button>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative flex-1">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                <p className="text-sm text-gray-500">Click to upload an image</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBannerImageChange(index, file);
                }}
              />
            </label>
          </div>

          {banner.imagePreview && (
            <div className="relative group flex-shrink-0">
              <img
                src={banner.imagePreview}
                alt={`Banner ${index + 1} Preview`}
                className="h-32 w-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer"
                onClick={() => setSelectedImage(banner.imagePreview)}
              />
              <button
                onClick={() => removeBannerImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors"
              >
                <i className="fas fa-times w-3 h-3"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Heading", field: "heading", icon: "fas fa-heading", placeholder: "Banner heading" },
          { label: "Subtext", field: "subtext", icon: "fas fa-text-height", placeholder: "Banner subtext" },
          { label: "Button Text", field: "buttonText", icon: "fas fa-mouse-pointer", placeholder: "Button text" },
          { label: "Redirect URL", field: "redirectUrl", icon: "fas fa-link", placeholder: "/product/123 or /blog/abc" }
        ].map((item) => (
          <div key={item.field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
            <div className="relative">
              <i className={`${item.icon} absolute left-3 top-3 text-gray-400`}></i>
              <input
                type="text"
                placeholder={item.placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                value={banner[item.field] || ""}
                onChange={(e) => {
                  const updated = [...banners];
                  updated[index][item.field] = e.target.value;
                  setBanners(updated);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerTab;
