import React from 'react';

const OtherTab = ({ 
  deliverySettings, 
  setDeliverySettings, 
  banners, 
  setBanners, 
  selectedImage, 
  setSelectedImage,
  previewUrlsRef 
}) => {

  const handleBannerImageChange = (index, file) => {
    if (!file) return;
    const updated = [...banners];

    // revoke old preview for this banner (if any)
    const old = updated[index]?.imagePreview;
    if (old) {
      URL.revokeObjectURL(old);
      previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== old);
    }

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
    <div className="p-4 bg-gray-50 rounded-lg space-y-6">
      {/* Delivery Settings */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">
          Delivery Settings
        </h3>

        {/* Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryMode"
              value="fixed"
              checked={deliverySettings.mode === "fixed"}
              onChange={() =>
                setDeliverySettings({
                  ...deliverySettings,
                  mode: "fixed",
                })
              }
            />
            Fixed Charges
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryMode"
              value="api"
              checked={deliverySettings.mode === "api"}
              onChange={() =>
                setDeliverySettings({
                  ...deliverySettings,
                  mode: "api",
                })
              }
            />
            From API
          </label>
        </div>

        {/* Mode-specific input */}
        {deliverySettings.mode === "fixed" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fixed Delivery Charges
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              value={deliverySettings.fixedCharge}
              onChange={(e) =>
                setDeliverySettings({
                  ...deliverySettings,
                  fixedCharge: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL to fetch delivery charge
            </label>
            <input
              type="text"
              placeholder="https://api.example.com/delivery-charge"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              value={deliverySettings.apiUrl}
              onChange={(e) =>
                setDeliverySettings({
                  ...deliverySettings,
                  apiUrl: e.target.value,
                })
              }
            />
          </div>
        )}

        {/* Free delivery above */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Free Delivery Above
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
            value={deliverySettings.freeDeliveryAbove}
            onChange={(e) =>
              setDeliverySettings({
                ...deliverySettings,
                freeDeliveryAbove: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      {/* Banner Management */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Homepage Banners</h3>
          <button
            type="button"
            onClick={() =>
              setBanners([
                ...banners,
                { heading: "", subtext: "", buttonText: "", redirectUrl: "", imageFile: null, imagePreview: "" },
              ])
            }
            className="flex items-center gap-2 px-4 py-2 bg-black text-white  hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-plus"></i>
            Add New Banner
          </button>
        </div>

        {/* Banners List */}
        <div className="space-y-5">
          {banners.map((banner, index) => (
            <div
              key={index}
              className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Banner Header with Index and Remove Button */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Banner #{index + 1}</span>
                <button
                  onClick={() => {
                    const updated = banners.filter((_, i) => i !== index);
                    setBanners(updated);
                  }}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
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
                            const file = e.target.files[0];
                            if (file) {
                              handleBannerImageChange(index, file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {banner.imagePreview && (
                      <div className="relative group flex-shrink-0">
                        <img
                          src={banner.imagePreview}
                          alt="Banner Preview"
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

                {/* Text Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                    <div className="relative">
                      <i className="fas fa-heading absolute left-3 top-3 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="Banner heading"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        value={banner.heading}
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index].heading = e.target.value;
                          setBanners(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
                    <div className="relative">
                      <i className="fas fa-text-height absolute left-3 top-3 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="Banner subtext"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        value={banner.subtext}
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index].subtext = e.target.value;
                          setBanners(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <div className="relative">
                      <i className="fas fa-mouse-pointer absolute left-3 top-3 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="Button text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        value={banner.buttonText}
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index].buttonText = e.target.value;
                          setBanners(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
                    <div className="relative">
                      <i className="fas fa-link absolute left-3 top-3 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="/product/123 or /blog/abc"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        value={banner.redirectUrl}
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index].redirectUrl = e.target.value;
                          setBanners(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <img
                src={selectedImage}
                alt="Full Preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <i className="fas fa-times w-5 h-5"></i>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Save */}
      <button className="px-4 py-2 bg-black text-white hover:bg-black">
        Save
      </button>
    </div>
  );
};

export default OtherTab;