import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const DealDetails = ({ deal, mode, token, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    ...deal,
    dealName: deal.dealName || '',
    dealDescription: deal.dealDescription || '',
    dealDiscountType: deal.dealDiscountType || 'percentage',
    dealDiscountValue: deal.dealDiscountValue || 0,
    dealTotal: deal.dealTotal || 0,
    dealFinalPrice: deal.dealFinalPrice || 0,
    dealStartDate: deal.dealStartDate ? new Date(deal.dealStartDate).toISOString().split('T')[0] : '',
    dealEndDate: deal.dealEndDate ? new Date(deal.dealEndDate).toISOString().split('T')[0] : '',
    status: deal.status || 'draft'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Prepare data for API - match backend field names exactly
      const updateData = {
        id: deal._id,
        dealName: formData.dealName,
        dealDescription: formData.dealDescription,
        dealDiscountType: formData.dealDiscountType,
        dealDiscountValue: Number(formData.dealDiscountValue),
        dealTotal: Number(formData.dealTotal),
        dealFinalPrice: Number(formData.dealFinalPrice),
        dealStartDate: formData.dealStartDate,
        dealEndDate: formData.dealEndDate,
        status: formData.status
      }

      console.log('Sending deal update data:', updateData)

      const response = await axios.post(
        backendUrl + '/api/deal/update',
        updateData,
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success('Deal updated successfully')
        onSave()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log('Deal update error:', error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this deal?')) {
      return
    }
    
    try {
      const response = await axios.post(
        backendUrl + '/api/deal/remove', 
        { id: deal._id }, 
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
              {mode === 'view' ? 'Deal Details' : 'Edit Deal'}
            </h2>
          </div>
          
          <div className="flex space-x-3">
            {mode === 'view' ? (
              <button
                onClick={() => window.location.href = `/edit-deal/${deal._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Deal
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

        {/* Deal Details */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            {mode === 'view' ? (
              <ViewMode deal={deal} />
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

const ViewMode = ({ deal }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Images */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Deal Images</h3>
      <div className="grid grid-cols-2 gap-4">
        {deal.dealImages && deal.dealImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${deal.dealName} ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        ))}
      </div>
    </div>

    {/* Details */}
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Deal Information</h3>
        <div className="space-y-3">
          <DetailRow label="Deal Name" value={deal.dealName} />
          <DetailRow label="Description" value={deal.dealDescription} />
          <DetailRow label="Discount Type" value={deal.dealDiscountType} />
          <DetailRow 
            label="Discount Value" 
            value={
              deal.dealDiscountType === 'percentage' 
                ? `${deal.dealDiscountValue}%` 
                : `${currency}${deal.dealDiscountValue}`
            } 
          />
          <DetailRow label="Total Price" value={`${currency}${deal.dealTotal}`} />
          <DetailRow label="Final Price" value={`${currency}${deal.dealFinalPrice}`} />
          <DetailRow label="Products Included" value={deal.dealProducts?.length || 0} />
          <DetailRow label="Start Date" value={new Date(deal.dealStartDate).toLocaleDateString()} />
          <DetailRow label="End Date" value={deal.dealEndDate ? new Date(deal.dealEndDate).toLocaleDateString() : 'No end date'} />
          <DetailRow label="Status" value={deal.status || 'draft'} />
          <DetailRow label="Date Created" value={new Date(deal.date).toLocaleDateString()} />
        </div>
      </div>

      {/* Products List */}
      {deal.dealProducts && deal.dealProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Included Products</h3>
          <div className="space-y-2">
            {deal.dealProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">{product.name || `Product ${index + 1}`}</span>
                <span className="text-gray-900 font-medium">{currency}{product.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)

const EditMode = ({ formData, onChange, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Deal Name</label>
        <input
          type="text"
          name="dealName"
          value={formData.dealName}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
        <select
          name="dealDiscountType"
          value={formData.dealDiscountType}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
        <input
          type="number"
          name="dealDiscountValue"
          value={formData.dealDiscountValue}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Total Price ({currency})</label>
        <input
          type="number"
          name="dealTotal"
          value={formData.dealTotal}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Final Price ({currency})</label>
        <input
          type="number"
          name="dealFinalPrice"
          value={formData.dealFinalPrice}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          name="dealStartDate"
          value={formData.dealStartDate}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
        <input
          type="date"
          name="dealEndDate"
          value={formData.dealEndDate}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="dealDescription"
          value={formData.dealDescription}
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

export default DealDetails