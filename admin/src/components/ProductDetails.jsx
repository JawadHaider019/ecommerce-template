import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Prepare data for API - match backend field names exactly
      const updateData = {
        id: product._id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        cost: Number(formData.cost),
        price: Number(formData.price),
        discountprice: Number(formData.discountprice),
        quantity: Number(formData.quantity),
        bestseller: formData.bestseller,
        status: formData.status
      }

      console.log('Sending update data:', updateData)

      const response = await axios.post(
        backendUrl + '/api/product/update',
        updateData,
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success('Product updated successfully')
        onSave()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log('Update error:', error)
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
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to List
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'view' ? 'Product Details' : 'Edit Product'}
            </h2>
          </div>
          
          <div className="flex space-x-3">
            {mode === 'view' ? (
              <button
                onClick={() => window.location.href = `/edit-product/${product._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Product
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            {mode === 'view' ? (
              <ViewMode product={product} />
            ) : (
              <EditMode 
                formData={formData} 
                onChange={handleChange} 
                loading={loading}
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
      <h3 className="text-lg font-semibold mb-4">Product Images</h3>
      <div className="grid grid-cols-2 gap-4">
        {product.image && product.image.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${product.name} ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        ))}
      </div>
    </div>

    {/* Details */}
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Product Information</h3>
        <div className="space-y-3">
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

const EditMode = ({ formData, onChange, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
        <input
          type="text"
          name="subcategory"
          value={formData.subcategory}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price ({currency})</label>
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ({currency})</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="bestseller"
          checked={formData.bestseller}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Mark as Bestseller</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
)

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
)

export default ProductDetails