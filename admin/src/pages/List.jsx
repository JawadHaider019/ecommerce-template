import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import ProductDetails from '../components/ProductDetails'
import DealDetails from '../components/DealDetails'

const List = ({ token }) => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list', 'view', 'edit'

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setProducts(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + '/api/deal/list')
      if (response.data.success) {
        setDeals(response.data.deals)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove', 
        { id }, 
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchProducts()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeDeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) {
      return
    }
    
    try {
      const response = await axios.post(
        backendUrl + '/api/deal/remove', 
        { id }, 
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchDeals()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

const updateProductStatus = async (id, status) => {
  try {
    console.log('Updating product status:', { id, status });
    const response = await axios.post(
      backendUrl + '/api/product/update-status',
      { id, status },
      { headers: { token } }
    )
    if (response.data.success) {
      toast.success('Product status updated successfully')
      await fetchProducts()
    } else {
      toast.error(response.data.message)
    }
  } catch (error) {
    console.log('Product status update error:', error)
    toast.error(error.response?.data?.message || error.message)
  }
}

const updateDealStatus = async (id, status) => {
  try {
    console.log('Updating deal status:', { id, status });
    const response = await axios.post(
      backendUrl + '/api/deal/update-status',
      { id, status },
      { headers: { token } }
    )
    if (response.data.success) {
      toast.success('Deal status updated successfully')
      await fetchDeals()
    } else {
      toast.error(response.data.message)
    }
  } catch (error) {
    console.log('Deal status update error:', error)
    toast.error(error.response?.data?.message || error.message)
  }
}
  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setViewMode('view')
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setViewMode('edit')
  }

  const handleViewDeal = (deal) => {
    setSelectedDeal(deal)
    setViewMode('view')
  }

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal)
    setViewMode('edit')
  }

  const handleBackToList = () => {
    setSelectedProduct(null)
    setSelectedDeal(null)
    setViewMode('list')
    if (activeTab === 'products') {
      fetchProducts()
    } else {
      fetchDeals()
    }
  }

  useEffect(() => {
    if (viewMode === 'list') {
      if (activeTab === 'products') {
        fetchProducts()
      } else {
        fetchDeals()
      }
    }
  }, [activeTab, viewMode])

  if (viewMode !== 'list') {
    if (activeTab === 'products' && selectedProduct) {
      return (
        <ProductDetails
          product={selectedProduct}
          mode={viewMode}
          token={token}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      )
    } else if (activeTab === 'deals' && selectedDeal) {
      return (
        <DealDetails
          deal={selectedDeal}
          mode={viewMode}
          token={token}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Management Dashboard</h2>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mt-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'deals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Deals ({deals.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <ProductListView
            products={products}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={removeProduct}
            onStatusChange={updateProductStatus}
          />
        )}

        {/* Deals Tab Content */}
        {activeTab === 'deals' && (
          <DealListView
            deals={deals}
            onView={handleViewDeal}
            onEdit={handleEditDeal}
            onDelete={removeDeal}
            onStatusChange={updateDealStatus}
          />
        )}
      </div>
    </div>
  )
}

// Product List View Component
const ProductListView = ({ products, onView, onEdit, onDelete, onStatusChange }) => {
  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-600">All Products List ({products.length} products)</p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.length === 0 ? (
          <EmptyState type="products" />
        ) : (
          products.map((item) => (
            <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col items-center gap-4">
                <img 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200" 
                  src={item.image[0]} 
                  alt={item.name} 
                />
                
                <div className="w-full text-center">
                  <h3 className="font-medium text-gray-900 text-base mb-3">{item.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Category</span>
                      <span className="text-xs font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Stock</span>
                      <span className={`text-xs font-medium ${
                        item.quantity > 10 ? 'text-green-600' :
                        item.quantity > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.quantity} left
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Price</span>
                      <span className="font-semibold text-green-600 text-sm">{currency}{item.discountprice}</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Status</span>
                      <StatusBadge status={item.status || 'draft'} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center space-x-2">
                <button
                  onClick={() => onView(item)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 flex justify-center">
                <StatusDropdown 
                  currentStatus={item.status || 'draft'} 
                  onStatusChange={(status) => onStatusChange(item._id, status)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] items-center py-4 px-6 bg-gray-50 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
          <span className="text-center">Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Original</span>
          <span>Quantity</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>

        <div className="divide-y divide-gray-200">
          {products.length === 0 ? (
            <EmptyState type="products" />
          ) : (
            products.map((item) => (
              <div 
                key={item._id} 
                className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] items-center gap-4 py-4 px-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex justify-center">
                  <img 
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                    src={item.image[0]} 
                    alt={item.name} 
                  />
                </div>
                
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                </div>
                
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                    {item.category}
                  </span>
                </div>
                
                <div>
                  <p className="font-semibold text-green-600 text-sm">{currency}{item.discountprice}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 line-through text-sm">{currency}{item.price}</p>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.quantity > 10 ? 'bg-green-100 text-green-800' :
                      item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.quantity}
                    </span>
                  </div>
                </div>

                <div>
                  <StatusBadge status={item.status || 'draft'} />
                </div>
                
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onView(item)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-200"
                    title="View product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors duration-200"
                    title="Edit product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                    title="Delete product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  <StatusDropdown 
                    currentStatus={item.status || 'draft'} 
                    onStatusChange={(status) => onStatusChange(item._id, status)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Deal List View Component
const DealListView = ({ deals, onView, onEdit, onDelete, onStatusChange }) => {
  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-600">All Deals List ({deals.length} deals)</p>
      </div>

      {/* Mobile Card View for Deals */}
      <div className="md:hidden space-y-4">
        {deals.length === 0 ? (
          <EmptyState type="deals" />
        ) : (
          deals.map((item) => (
            <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col items-center gap-4">
                <img 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200" 
                  src={item.dealImages[0]} 
                  alt={item.dealName} 
                />
                
                <div className="w-full text-center">
                  <h3 className="font-medium text-gray-900 text-base mb-3">{item.dealName}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Discount</span>
                      <span className="font-semibold text-green-600 text-sm">
                        {item.dealDiscountType === 'percentage' ? `${item.dealDiscountValue}%` : `${currency}${item.dealDiscountValue}`}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Products</span>
                      <span className="text-xs font-medium">
                        {item.dealProducts?.length || 0}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Start Date</span>
                      <span className="text-xs font-medium">
                        {new Date(item.dealStartDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-xs mb-1">Status</span>
                      <StatusBadge status={item.status || 'draft'} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center space-x-2">
                <button
                  onClick={() => onView(item)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 flex justify-center">
                <StatusDropdown 
                  currentStatus={item.status || 'draft'} 
                  onStatusChange={(status) => onStatusChange(item._id, status)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View for Deals */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] items-center py-4 px-6 bg-gray-50 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
          <span className="text-center">Image</span>
          <span>Deal Name</span>
          <span>Discount</span>
          <span>Products</span>
          <span>Start Date</span>
          <span>End Date</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>

        <div className="divide-y divide-gray-200">
          {deals.length === 0 ? (
            <EmptyState type="deals" />
          ) : (
            deals.map((item) => (
              <div 
                key={item._id} 
                className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] items-center gap-4 py-4 px-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex justify-center">
                  <img 
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                    src={item.dealImages[0]} 
                    alt={item.dealName} 
                  />
                </div>
                
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.dealName}</p>
                  <p className="text-gray-500 text-xs truncate">{item.dealDescription}</p>
                </div>
                
                <div>
                  <p className="font-semibold text-green-600 text-sm">
                    {item.dealDiscountType === 'percentage' ? `${item.dealDiscountValue}%` : `${currency}${item.dealDiscountValue}`}
                  </p>
                </div>
                
                <div>
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {item.dealProducts?.length || 0} products
                  </span>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm">
                    {new Date(item.dealStartDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">
                    {item.dealEndDate ? new Date(item.dealEndDate).toLocaleDateString() : 'No end date'}
                  </p>
                </div>

                <div>
                  <StatusBadge status={item.status || 'draft'} />
                </div>
                
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onView(item)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-200"
                    title="View deal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors duration-200"
                    title="Edit deal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                    title="Delete deal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  <StatusDropdown 
                    currentStatus={item.status || 'draft'} 
                    onStatusChange={(status) => onStatusChange(item._id, status)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    published: { color: 'bg-green-100 text-green-800', label: 'Published' },
    archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived' },
    scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' }
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

// Status Dropdown Component
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-gray-600' },
    { value: 'published', label: 'Published', color: 'text-green-600' },
    { value: 'archived', label: 'Archived', color: 'text-yellow-600' },
    { value: 'scheduled', label: 'Scheduled', color: 'text-blue-600' }
  ]

  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value} className={option.color}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// Empty State Component
const EmptyState = ({ type }) => (
  <div className="py-12 text-center">
    <div className="text-gray-400 mb-4">
      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
      </svg>
    </div>
    <p className="text-gray-500 text-lg">No {type} found</p>
    <p className="text-gray-400 mt-1">Add your first {type.slice(0, -1)} to get started</p>
  </div>
)

export default List