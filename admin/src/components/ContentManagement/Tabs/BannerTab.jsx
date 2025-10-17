// Banner.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';

// API service configuration
const API_BASE_URL = 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type];

  const icon = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 shadow-lg z-50 flex items-center gap-3 min-w-80`}>
      <i className={`fas ${icon} text-lg`}></i>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-lg"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, banner }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Banner</h3>
              <p className="text-gray-600">This action cannot be undone.</p>
            </div>
          </div>
          
          {banner && (
            <div className="bg-gray-50 p-4 mb-4">
              <p className="font-medium text-gray-800">Banner Details:</p>
              <p className="text-sm text-gray-600 mt-1">
                {banner.headingLine1 || 'Untitled Banner'} (Order: {banner.order})
              </p>
              {banner.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={banner.imageUrl} 
                    alt="Banner preview" 
                    className="h-20 w-32 object-cover border"
                  />
                </div>
              )}
            </div>
          )}

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this banner? This will permanently remove the banner and its associated image.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-trash-alt"></i>
              Delete Banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Banner Management Component - Use this for admin management
export const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, banner: null, index: null });
  const previewUrlsRef = useRef([]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Load banners from backend
  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/banners');
      
      if (response.data.success) {
        // Sort banners by order field
        const sortedBanners = response.data.data.sort((a, b) => a.order - b.order);
        const bannersWithPreview = sortedBanners.map(banner => ({
          ...banner,
          imagePreview: banner.imageUrl,
          imageFile: null,
          isEditing: false // Add editing state
        }));
        setBanners(bannersWithPreview);
        showToast('Banners loaded successfully', 'success');
      } else {
        throw new Error(response.data.message || 'Failed to load banners');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load banners';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save individual banner
  const handleSaveBanner = async (bannerData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to formData
      const fields = ['headingLine1', 'headingLine2', 'subtext', 'buttonText', 'redirectUrl', 'isActive', 'order'];
      fields.forEach(field => {
        if (bannerData[field] !== undefined && bannerData[field] !== null) {
          formData.append(field, bannerData[field]);
        }
      });

      // Append image file if exists
      if (bannerData.imageFile) {
        formData.append('image', bannerData.imageFile);
      }

      let response;
      if (bannerData._id) {
        response = await api.put(`/api/banners/${bannerData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/api/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save banner';
      throw new Error(errorMessage);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (bannerId, index) => {
    try {
      if (bannerId) {
        await api.delete(`/api/banners/${bannerId}`);
      }
      
      const updatedBanners = banners.filter((_, i) => i !== index);
      setBanners(updatedBanners);
      showToast('Banner deleted successfully', 'success');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  // Add new banner
  const handleAddBanner = () => {
    const newOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 0;
    setBanners([...banners, {
      headingLine1: '',
      headingLine2: '',
      subtext: '',
      buttonText: '',
      redirectUrl: '',
      imageFile: null,
      imagePreview: '',
      isActive: true,
      order: newOrder,
      isEditing: true // New banners start in edit mode
    }]);
    showToast('New banner added', 'info');
  };

  // Save all banners
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Save each banner
      for (let i = 0; i < banners.length; i++) {
        const banner = banners[i];
        await handleSaveBanner(banner);
      }
      
      // Reload banners to get updated data
      await loadBanners();
      showToast('All banners saved successfully', 'success');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save banners';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (index) => {
    setDeleteModal({
      isOpen: true,
      banner: banners[index],
      index: index
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, banner: null, index: null });
  };

  // Confirm delete banner
  const confirmDeleteBanner = async () => {
    const { index } = deleteModal;
    const banner = banners[index];
    
    try {
      await handleDeleteBanner(banner._id, index);
      closeDeleteModal();
    } catch (error) {
      showToast('Error deleting banner: ' + error.message, 'error');
      closeDeleteModal();
    }
  };

  // Toggle edit mode for a banner
  const toggleEditMode = (index) => {
    const updated = [...banners];
    updated[index].isEditing = !updated[index].isEditing;
    setBanners(updated);
  };

  // Move banner up in order
  const moveBannerUp = (index) => {
    if (index === 0) return; // Can't move first item up
    
    const updated = [...banners];
    const currentOrder = updated[index].order;
    const prevOrder = updated[index - 1].order;
    
    // Swap orders
    updated[index].order = prevOrder;
    updated[index - 1].order = currentOrder;
    
    // Sort by order
    updated.sort((a, b) => a.order - b.order);
    setBanners(updated);
    showToast('Banner order updated', 'info');
  };

  // Move banner down in order
  const moveBannerDown = (index) => {
    if (index === banners.length - 1) return; // Can't move last item down
    
    const updated = [...banners];
    const currentOrder = updated[index].order;
    const nextOrder = updated[index + 1].order;
    
    // Swap orders
    updated[index].order = nextOrder;
    updated[index + 1].order = currentOrder;
    
    // Sort by order
    updated.sort((a, b) => a.order - b.order);
    setBanners(updated);
    showToast('Banner order updated', 'info');
  };

  // Update banner order manually
  const updateBannerOrder = (index, newOrder) => {
    const updated = [...banners];
    const oldOrder = updated[index].order;
    
    // If another banner has this order, swap them
    const existingBannerIndex = updated.findIndex(b => b.order === newOrder && b !== updated[index]);
    if (existingBannerIndex !== -1) {
      updated[existingBannerIndex].order = oldOrder;
    }
    
    updated[index].order = newOrder;
    
    // Sort by order
    updated.sort((a, b) => a.order - b.order);
    setBanners(updated);
  };

  // Load banners on component mount
  useEffect(() => {
    loadBanners();
  }, []);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Loading banners...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteBanner}
        banner={deleteModal.banner}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
          <p className="text-gray-600 mt-1">
            {banners.length} banner{banners.length !== 1 ? 's' : ''} found
            {banners.filter(b => b._id).length > 0 && ` (${banners.filter(b => b._id).length} saved)`}
          </p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddBanner}
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Banner
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

 

      {/* Banner List */}
      <div className="space-y-6">
        {banners.map((banner, index) => (
          <BannerCard
            key={banner._id || `banner-${index}`}
            banner={banner}
            index={index}
            banners={banners}
            setBanners={setBanners}
            previewUrlsRef={previewUrlsRef}
            setSelectedImage={setSelectedImage}
            onRemove={() => openDeleteModal(index)}
            onSave={handleSaveBanner}
            onReload={loadBanners}
            onToggleEdit={() => toggleEditMode(index)}
            onMoveUp={() => moveBannerUp(index)}
            onMoveDown={() => moveBannerDown(index)}
            onUpdateOrder={(newOrder) => updateBannerOrder(index, newOrder)}
            showToast={showToast}
          />
        ))}
      </div>

      {banners.length === 0 && !loading && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300">
          <i className="fas fa-image text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500 text-lg">No banners created yet</p>
          <button
            onClick={handleAddBanner}
            className="mt-4 bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Create Your First Banner
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Combined Banner Card with Edit/Save functionality
const BannerCard = ({ 
  banner, 
  index, 
  banners, 
  setBanners, 
  previewUrlsRef, 
  setSelectedImage, 
  onRemove,
  onSave,
  onReload,
  onToggleEdit,
  onMoveUp,
  onMoveDown,
  onUpdateOrder,
  showToast
}) => {
  const [isActive, setIsActive] = useState(banner.isActive !== false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const handleBannerImageChange = (index, file) => {
    if (!file) return;

    const updated = [...banners];

    // Remove old preview if exists
    const old = updated[index]?.imagePreview;
    if (old && old.startsWith('blob:')) {
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
    if (old && old.startsWith('blob:')) {
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

  const handleActiveToggle = (checked) => {
    setIsActive(checked);
    const updated = [...banners];
    updated[index].isActive = checked;
    setBanners(updated);
  };

  const handleSaveSingle = async () => {
    try {
      setSaving(true);
      
      if (typeof onSave !== 'function') {
        throw new Error('Save function is not available');
      }
      
      const result = await onSave(banner);
      
      if (result && result.data) {
        // Update local state with saved banner data
        const updated = [...banners];
        updated[index] = {
          ...result.data,
          imagePreview: result.data.imageUrl,
          imageFile: null,
          isEditing: false // Exit edit mode after save
        };
        setBanners(updated);
        
        setLastSaved(new Date());
        showToast('Banner saved successfully', 'success');
        
        // Reload all banners to ensure consistency
        if (onReload) {
          setTimeout(onReload, 1000);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      showToast('Error saving banner: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = () => {
    if (!banner._id) {
      return banner.headingLine1 || banner.headingLine2 || banner.subtext || banner.buttonText || banner.redirectUrl || banner.imageFile;
    }
    return false;
  };

  return (
    <div className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Order: {banner.order}</span>
            <div className="flex flex-col gap-1">
              <button
                onClick={onMoveUp}
                disabled={index === 0}
                className="bg-gray-200 text-gray-700 p-1 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-up text-xs"></i>
              </button>
              <button
                onClick={onMoveDown}
                disabled={index === banners.length - 1}
                className="bg-gray-200 text-gray-700 p-1 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => handleActiveToggle(e.target.checked)}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Active</span>
          </label>
          
          {/* Status Badges */}
          <div className="flex gap-2">
            {banner._id && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 flex items-center gap-1">
                <i className="fas fa-check"></i>
                Saved
              </span>
            )}
            {hasUnsavedChanges() && banner.isEditing && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 flex items-center gap-1">
                <i className="fas fa-edit"></i>
                Unsaved
              </span>
            )}
            {lastSaved && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={banner.isEditing ? handleSaveSingle : onToggleEdit}
            disabled={saving}
            className={`flex items-center gap-1 text-sm px-3 py-2 transition-colors ${
              banner.isEditing 
                ? 'bg-black text-white hover:bg-gray-800 disabled:opacity-50' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : banner.isEditing ? 'fa-save' : 'fa-edit'}`}></i>
            {saving ? 'Saving...' : banner.isEditing ? 'Save Banner' : 'Edit Banner'}
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-sm bg-red-600 text-white px-3 py-2 hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-trash-alt"></i>
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {banner.isEditing ? (
          /* Edit Mode */
          <>
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image {!banner.imageUrl && <span className="text-red-500">*</span>}
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-400 transition-colors bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-500">Click to upload an image</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended: 1920x600px</p>
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

                {(banner.imagePreview || banner.imageUrl) && (
                  <div className="relative group flex-shrink-0">
                    <img
                      src={banner.imagePreview || banner.imageUrl}
                      alt={`Banner ${index + 1} Preview`}
                      className="h-32 w-48 object-cover border-2 border-gray-200 cursor-pointer shadow-sm"
                      onClick={() => setSelectedImage(banner.imagePreview || banner.imageUrl)}
                    />
                    <button
                      onClick={() => removeBannerImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 text-xs hover:bg-red-700 transition-colors shadow-md"
                    >
                      <i className="fas fa-times w-3 h-3"></i>
                    </button>
                    {banner.imageUrl && !banner.imageFile && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                        From DB
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { 
                  label: "Order Number", 
                  field: "order", 
                  icon: "fas fa-sort-numeric-down", 
                  placeholder: "0",
                  type: "number",
                  required: true
                },
                { 
                  label: "Heading Line 1", 
                  field: "headingLine1", 
                  icon: "fas fa-heading", 
                  placeholder: "First line of heading",
                  required: true
                },
                { 
                  label: "Heading Line 2", 
                  field: "headingLine2", 
                  icon: "fas fa-heading", 
                  placeholder: "Second line of heading",
                  required: true
                },
                { 
                  label: "Subtext", 
                  field: "subtext", 
                  icon: "fas fa-text-height", 
                  placeholder: "Banner description text",
                  type: "textarea"
                },
                { 
                  label: "Button Text", 
                  field: "buttonText", 
                  icon: "fas fa-mouse-pointer", 
                  placeholder: "Shop Now" 
                },
                { 
                  label: "Redirect URL", 
                  field: "redirectUrl", 
                  icon: "fas fa-link", 
                  placeholder: "/shop or /collection" 
                }
              ].map((item) => (
                <div key={item.field} className={item.type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <i className={`${item.icon} absolute left-3 top-3 text-gray-400`}></i>
                    {item.type === "textarea" ? (
                      <textarea
                        placeholder={item.placeholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
                        rows={3}
                        value={banner[item.field] || ""}
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index][item.field] = e.target.value;
                          setBanners(updated);
                        }}
                      />
                    ) : item.type === "number" ? (
                      <input
                        type="number"
                        placeholder={item.placeholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        value={banner[item.field] || 0}
                        min="0"
                        onChange={(e) => {
                          const newOrder = parseInt(e.target.value) || 0;
                          onUpdateOrder(newOrder);
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={item.placeholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        value={banner[item.field] || ""}
                        onChange={(e) => {
                          const updated = [...banners];
                          updated[index][item.field] = e.target.value;
                          setBanners(updated);
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* View Mode */
          <div className="flex flex-col gap-2">
            {/* Banner Preview */}
            <div >
              <div className="relative h-100 overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border">
                {(banner.imagePreview || banner.imageUrl) ? (
                  <img
                    src={banner.imagePreview || banner.imageUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <i className="fas fa-image text-2xl mb-2"></i>
                      <p className="text-sm">Banner Image</p>
                    </div>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center">
                  <div className="text-white p-6 max-w-md">
                    <div className="mb-3">
                      <h2 className="text-3xl font-bold leading-tight sm:py-3 sm:text-4xl lg:text-5xl">
                        {banner.headingLine1 ? (
                          <div>
                            <div>{banner.headingLine1}</div>
                            {banner.headingLine2 && (
                              <div className="mt-1">{banner.headingLine2}</div>
                            )}
                          </div>
                        ) : (
                          "Your Banner Heading"
                        )}
                      </h2>
                    </div>
                    
                    <p className="mt-2 text-sm font-medium sm:text-base">
                      {banner.subtext || "Banner description text will appear here"}
                    </p>
                    
                    {banner.buttonText && (
                      <button className="text-sm font-medium transition hover:text-gray-300 md:text-base flex items-center justify-center gap-2 mt-4">
                        <p className="h-px w-8 bg-white"></p>
                        {banner.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Banner Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Order:</span>
                    <p className="text-gray-600">{banner.order}</p>
                  </div>
                  <div>
                    <span className="font-medium">Heading 1:</span>
                    <p className="text-gray-600">{banner.headingLine1 || "Not set"}</p>
                  </div>
                  {banner.headingLine2 && (
                    <div>
                      <span className="font-medium">Heading 2:</span>
                      <p className="text-gray-600">{banner.headingLine2}</p>
                    </div>
                  )}
                  {banner.subtext && (
                    <div>
                      <span className="font-medium">Subtext:</span>
                      <p className="text-gray-600">{banner.subtext}</p>
                    </div>
                  )}
                  {banner.buttonText && (
                    <div>
                      <span className="font-medium">Button Text:</span>
                      <p className="text-gray-600">{banner.buttonText}</p>
                    </div>
                  )}
                  {banner.redirectUrl && (
                    <div>
                      <span className="font-medium">Redirect URL:</span>
                      <p className="text-gray-600">{banner.redirectUrl}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>{banner.isEditing ? "Edit mode - Make changes and click Save" : "View mode - Click Edit to modify this banner"}</span>
            <span className={`px-2 py-1 ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Banner Display Component for Website
export const BannerDisplay = ({ banners = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeBanners, setActiveBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load active banners from backend if not provided
  useEffect(() => {
    const loadActiveBanners = async () => {
      if (banners.length === 0) {
        try {
          setLoading(true);
          const response = await api.get('/api/banners/active');
          if (response.data.success) {
            // Sort active banners by order
            const sortedBanners = response.data.data.sort((a, b) => a.order - b.order);
            setActiveBanners(sortedBanners);
          }
        } catch (error) {
          console.error('Error loading active banners:', error);
        } finally {
          setLoading(false);
        }
      } else {
        const sortedBanners = banners
          .filter(banner => banner.isActive !== false)
          .sort((a, b) => a.order - b.order);
        setActiveBanners(sortedBanners);
      }
    };

    loadActiveBanners();
  }, [banners]);

  useEffect(() => {
    if (activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeBanners.length]);

  if (loading) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p className="text-lg">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (activeBanners.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <i className="fas fa-image text-4xl mb-4"></i>
          <p className="text-lg">No active banners available</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Slides */}
      {activeBanners.map((banner, index) => (
        <div
          key={banner._id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.headingLine1 || `Banner ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-green-100 to-emerald-100"></div>
          )}
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl text-white">
                {/* Two-line Heading */}
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  {banner.headingLine1 && (
                    <div>
                      <div className="mb-2">{banner.headingLine1}</div>
                      {banner.headingLine2 && (
                        <div>{banner.headingLine2}</div>
                      )}
                    </div>
                  )}
                </h1>
                
                {/* Subtext */}
                <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-lg leading-relaxed">
                  {banner.subtext}
                </p>
                
                {/* Button */}
                {banner.buttonText && (
                  <a
                    href={banner.redirectUrl || "#"}
                    className="inline-block bg-white text-green-800 px-10 py-4 font-semibold text-lg hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {banner.buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-110' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => 
              (prev - 1 + activeBanners.length) % activeBanners.length
            )}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 transition-all duration-300 z-20 hover:scale-110"
          >
            <i className="fas fa-chevron-left w-5 h-5"></i>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => 
              (prev + 1) % activeBanners.length
            )}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 transition-all duration-300 z-20 hover:scale-110"
          >
            <i className="fas fa-chevron-right w-5 h-5"></i>
          </button>
        </>
      )}
    </section>
  );
};

export default BannerCard;