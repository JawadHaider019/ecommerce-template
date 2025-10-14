import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import ProductDetails from '../components/ProductDetails'
import DealDetails from '../components/DealDetails'
import { 
  FaBox, 
  FaTags, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt,
  FaShoppingBag,
  FaPercentage,
  FaDollarSign,
  FaCube,
  FaFire
} from 'react-icons/fa'

const List = ({ token }) => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [viewMode, setViewMode] = useState('list')

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
   
    setProducts(prev =>
      prev.map(p => (p._id === id ? { ...p, status } : p))
    )

    const response = await axios.post(
      backendUrl + '/api/product/update-status',
      { id, status },
      { headers: { token } }
    )

    if (response.data.success) {
      toast.success('Product status updated successfully')
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                  <div className="h-40 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Management Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your products and deals efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {activeTab === 'products' ? `${products.length} products` : `${deals.length} deals`}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'products'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaBox className="w-5 h-5" />
                    <span>Products</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {products.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('deals')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'deals'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaTags className="w-5 h-5" />
                    <span>Deals</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {deals.length}
                    </span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'products' && (
          <ProductListView
            products={products}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={removeProduct}
            onStatusChange={updateProductStatus}
          />
        )}

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
      {/* Mobile & Tablet Grid View */}
      <div className="lg:hidden">
        {products.length === 0 ? (
          <EmptyState type="products" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    <img 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" 
                      src={item.image[0]} 
                      alt={item.name} 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{item.name}</h3>
                      <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                        {item.description || 'No description available'}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Category</span>
                          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full capitalize">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Price</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-green-600 text-sm">{currency}{item.discountprice}</span>
                            {item.price > item.discountprice && (
                              <span className="text-gray-400 line-through text-xs">{currency}{item.price}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Stock</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.quantity > 10 ? 'bg-green-100 text-green-700' :
                            item.quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.quantity} left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                     
                      <StatusDropdown 
                        currentStatus={item.status || 'draft'} 
                        onStatusChange={(status) => onStatusChange(item._id, status)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <ActionButton
                        onClick={() => onView(item)}
                        variant="primary"
                        icon="view"
                        label="View"
                        fullWidth
                      />
                      <ActionButton
                        onClick={() => onEdit(item)}
                        variant="secondary"
                        icon="edit"
                        label="Edit"
                        fullWidth
                      />
                      <ActionButton
                        onClick={() => onDelete(item._id)}
                        variant="danger"
                        icon="delete"
                        
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState type="products" />
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                          src={item.image[0]} 
                          alt={item.name} 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                          <p className="text-gray-500 text-xs line-clamp-2 mt-1">
                            {item.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-green-600 text-sm">{currency}{item.discountprice}</span>
                        {item.price > item.discountprice && (
                          <span className="text-gray-400 line-through text-xs">{currency}{item.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.quantity > 10 ? 'bg-green-400' :
                          item.quantity > 0 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className="text-sm text-gray-600">{item.quantity}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                       
                        <StatusDropdown 
                          currentStatus={item.status || 'draft'} 
                          onStatusChange={(status) => onStatusChange(item._id, status)}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <ActionButton
                          onClick={() => onView(item)}
                          variant="primary"
                          icon="view"
                          size="sm"
                        />
                        <ActionButton
                          onClick={() => onEdit(item)}
                          variant="secondary"
                          icon="edit"
                          size="sm"
                        />
                        <ActionButton
                          onClick={() => onDelete(item._id)}
                          variant="danger"
                          icon="delete"
                          size="sm"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Deal List View Component
const DealListView = ({ deals, onView, onEdit, onDelete, onStatusChange }) => {
  return (
    <div>
      {/* Mobile & Tablet Grid View */}
      <div className="lg:hidden">
        {deals.length === 0 ? (
          <EmptyState type="deals" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deals.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-3">
                  <div className="flex items-start space-x-4">
                    <img 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" 
                      src={item.dealImages[0]} 
                      alt={item.dealName} 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{item.dealName}</h3>
                      <p className="text-gray-500 text-xs truncate mb-2">{item.dealDescription}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Type</span>
                          <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-full capitalize">
                            {item.dealType || 'standard'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Discount</span>
                          <span className="font-semibold text-green-600 text-sm">
                            {item.dealDiscountType === 'percentage' ? `${item.dealDiscountValue}%` : `${currency}${item.dealDiscountValue}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Products</span>
                          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {item.dealProducts?.length || 0} items
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Period</span>
                          <span className="text-xs text-gray-600">
                            {new Date(item.dealStartDate).toLocaleDateString()}
                            {item.dealEndDate && ` - ${new Date(item.dealEndDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                     
                      <StatusDropdown 
                        currentStatus={item.status || 'draft'} 
                        onStatusChange={(status) => onStatusChange(item._id, status)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <ActionButton
                        onClick={() => onView(item)}
                        variant="primary"
                        icon="view"
                                              fullWidth
                      />
                      <ActionButton
                        onClick={() => onEdit(item)}
                        variant="secondary"
                        icon="edit"
                                                fullWidth
                      />
                      <ActionButton
                        onClick={() => onDelete(item._id)}
                        variant="danger"
                        icon="delete"
                        
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Deal</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState type="deals" />
                  </td>
                </tr>
              ) : (
                deals.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                          src={item.dealImages[0]} 
                          alt={item.dealName} 
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.dealName}</p>
                          <p className="text-gray-500 text-xs truncate">{item.dealDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium capitalize">
                        <FaFire className="w-3 h-3 mr-1" />
                        {item.dealType || 'standard'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        {item.dealDiscountType === 'percentage' ? (
                          <FaPercentage className="w-3 h-3 text-green-500" />
                        ) : (
                          <FaDollarSign className="w-3 h-3 text-green-500" />
                        )}
                        <span className="font-semibold text-green-600 text-sm">
                          {item.dealDiscountType === 'percentage' ? `${item.dealDiscountValue}%` : `${currency}${item.dealDiscountValue}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <FaCube className="w-3 h-3 mr-1" />
                        {item.dealProducts?.length || 0} products
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          <span>{new Date(item.dealStartDate).toLocaleDateString()}</span>
                        </div>
                        {item.dealEndDate && (
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                            <span>{new Date(item.dealEndDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                       
                        <StatusDropdown 
                          currentStatus={item.status || 'draft'} 
                          onStatusChange={(status) => onStatusChange(item._id, status)}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <ActionButton
                          onClick={() => onView(item)}
                          variant="primary"
                          icon="view"
                          size="sm"
                        />
                        <ActionButton
                          onClick={() => onEdit(item)}
                          variant="secondary"
                          icon="edit"
                          size="sm"
                        />
                        <ActionButton
                          onClick={() => onDelete(item._id)}
                          variant="danger"
                          icon="delete"
                          size="sm"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: '✏️' },
    published: { color: 'bg-green-100 text-green-800', label: 'Published', icon: '✅' },
    archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived', icon: '📁' },
    scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: '⏰' }
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
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
      className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value} className={option.color}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// Action Button Component
const ActionButton = ({ onClick, variant, icon, label, size = 'md', fullWidth = false }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
  }

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  const widthClass = fullWidth ? "w-full" : ""

  const icons = {
    view: <FaEye className="w-4 h-4 mr-2" />,
    edit: <FaEdit className="w-4 h-4 mr-2" />,
    delete: <FaTrash className="w-4 h-4 mr-2" />
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass}`}
    >
      {icons[icon]}
      {label}
    </button>
  )
}

// Empty State Component
const EmptyState = ({ type }) => (
  <div className="py-16 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {type === 'products' ? (
          <FaShoppingBag className="w-8 h-8 text-gray-400" />
        ) : (
          <FaTags className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No {type} found</h3>
      <p className="text-gray-500 mb-6">Get started by creating your first {type.slice(0, -1)}</p>
      <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200">
        Create {type.slice(0, -1)}
      </button>
    </div>
  </div>
)

export default List