import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { FaArrowLeft, FaTimes, FaShoppingBag } from 'react-icons/fa'

const ProductDetails = ({ product, mode, token, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    ...product,
    name: product.name || '',
    description: product.description || '',
    category: product.category || '',
    subcategory: product.subcategory || '',
    cost: product.cost || 0,
    price: product.price || 0,
    discountprice: product.discountprice || 0,
    quantity: product.quantity || 0,
    bestseller: product.bestseller || false,
    status: product.status || 'draft'
  })
  
  const [loading, setLoading] = useState(false)
  const [newImages, setNewImages] = useState([])
  const [removedImages, setRemovedImages] = useState([])
  
  // Hardcoded categories and subcategories
  const categories = ['Soap', 'Shampoo', 'Cream']
  
  const subcategoriesMap = {
    'Soap': ['Neem', 'Rice', 'Charcole'],
    'Shampoo': ['AntiHairfall', 'Silk'],
    'Cream': ['Night', 'Mens', 'Beauty']
  }

  const [subcategories, setSubcategories] = useState([])

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category && subcategoriesMap[formData.category]) {
      setSubcategories(subcategoriesMap[formData.category])
    } else {
      setSubcategories([])
    }
  }, [formData.category])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    console.log(`Changing ${name} to:`, type === 'checkbox' ? checked : value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(prev => [...prev, ...files])
  }

  // Remove existing image
  const removeExistingImage = (index) => {
    setRemovedImages(prev => [...prev, formData.image[index]])
    setFormData(prev => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index)
    }))
  }

  // Remove new image (before upload)
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      console.log("=== DEBUG: Saving Product ===");
      console.log("Product ID:", product._id);
      console.log("Current formData.status:", formData.status);
      console.log("Current formData.images:", formData.image);
      console.log("New images to upload:", newImages.length);
      console.log("Removed images:", removedImages);

      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add basic fields
      formDataToSend.append('id', product._id)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('subcategory', formData.subcategory)
      formDataToSend.append('cost', formData.cost)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('discountprice', formData.discountprice)
      formDataToSend.append('quantity', formData.quantity)
      formDataToSend.append('bestseller', formData.bestseller)
      formDataToSend.append('status', formData.status) // This will now have the correct value
      
      // Send removedImages as a proper JSON string
      formDataToSend.append('removedImages', JSON.stringify(removedImages))
      
      // Add new images
      newImages.forEach((image, index) => {
        formDataToSend.append(`image${index + 1}`, image)
      })

      // Debug: Log what's being sent
      console.log("=== FORM DATA CONTENTS ===");
      for (let pair of formDataToSend.entries()) {
        if (pair[0].includes('image') && pair[1] instanceof File) {
          console.log(pair[0] + ': [FILE] -', pair[1].name);
        } else if (pair[0] === 'removedImages') {
          console.log(pair[0] + ':', pair[1]);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      const response = await axios.post(
        backendUrl + '/api/product/update',
        formDataToSend,
        { 
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )
      
      if (response.data.success) {
        toast.success('Product updated successfully')
        console.log("Updated product response:", response.data.product);
        console.log("Updated product status:", response.data.product.status);
        
        // Clear the image states after successful save
        setNewImages([])
        setRemovedImages([])
        
        onSave()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log('Product update error:', error)
      console.log('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove', 
        { id: product._id }, 
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        onBack()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'view' ? 'Product Details' : 'Edit Product'}
            </h2>
            {mode === 'edit' && (
              <p className="text-gray-600 mt-1">Make changes to your product information</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {mode === 'view' ? (
              <button
                onClick={() => window.location.href = `/edit-product/${product._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Edit Product
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 font-medium flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {mode === 'view' ? (
              <ViewMode product={product} />
            ) : (
              <EditMode 
                formData={formData}
                onChange={handleChange} // Use the same handler for all fields
                loading={loading}
                categories={categories}
                subcategories={subcategories}
                // Image management props
                newImages={newImages}
                removedImages={removedImages}
                onImageUpload={handleImageUpload}
                onRemoveExistingImage={removeExistingImage}
                onRemoveNewImage={removeNewImage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ViewMode = ({ product }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Images */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Images</h3>
      <div className="grid grid-cols-2 gap-4">
        {product.image && product.image.map((img, index) => (
          <div key={index} className="relative">
            <img
              src={img}
              alt={`${product.name} ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        ))}
      </div>
    </div>

    {/* Details */}
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Information</h3>
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <DetailRow label="Name" value={product.name} />
          <DetailRow label="Description" value={product.description} />
          <DetailRow label="Category" value={product.category} />
          <DetailRow label="Subcategory" value={product.subcategory || 'N/A'} />
          <DetailRow label="Cost Price" value={`${currency}${product.cost}`} />
          <DetailRow label="Original Price" value={`${currency}${product.price}`} />
          <DetailRow label="Discount Price" value={`${currency}${product.discountprice}`} />
          <DetailRow label="Quantity" value={product.quantity} />
          <DetailRow label="Bestseller" value={product.bestseller ? 'Yes' : 'No'} />
          <DetailRow label="Status" value={product.status || 'draft'} />
          <DetailRow label="Date Added" value={new Date(product.date).toLocaleDateString()} />
        </div>
      </div>
    </div>
  </div>
)
const EditMode = ({ 
  formData, 
  onChange, 
  loading,
  categories,
  subcategories,
  newImages,
  removedImages,
  onImageUpload,
  onRemoveExistingImage,
  onRemoveNewImage
}) => (
  <div className="space-y-8">
    {/* Product Information */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
          <select
            name="subcategory"
            value={formData.subcategory}
            onChange={onChange}
            disabled={!formData.category}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
          {!formData.category && (
            <p className="text-sm text-gray-500 mt-1">Please select a category first</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price ({currency})</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={onChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ({currency})</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price ({currency})</label>
          <input
            type="number"
            name="discountprice"
            value={formData.discountprice}
            onChange={onChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={onChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange} // Use the same onChange handler
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">Current status: <span className="font-medium capitalize">{formData.status}</span></p>
        </div>

        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            name="bestseller"
            checked={formData.bestseller}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 font-medium">Mark as Bestseller</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter product description..."
          />
        </div>
      </div>
    </div>

   {/* Image Management */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Images</h3>
      
      {/* Removed Images Info */}
      {removedImages.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">{removedImages.length} image(s)</span> will be removed when you save changes.
          </p>
        </div>
      )}
      
      {/* Existing Images */}
      {formData.image && formData.image.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.image.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveExistingImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">New Images to Upload</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`New image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveNewImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add More Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageUpload}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-sm text-gray-500 mt-2">You can select multiple images. New images will be added to existing ones.</p>
      </div>
    </div>
  </div>
)


const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
)

export default ProductDetails