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
  FaFire,
  FaPlus,
  FaMinus,
  FaWarehouse,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes
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
    console.log('Products API Response:', response.data) // Debug log
    
    if (response.data.success) {
      console.log('Products with categories:', response.data.products.map(p => ({
        name: p.name,
        category: p.category,
        subcategory: p.subcategory
      }))) // Debug log
      
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

  const updateProductStock = async (productId, newQuantity) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/update-stock',
        { id: productId, quantity: newQuantity },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Stock updated successfully')
        // Update local state
        setProducts(prev =>
          prev.map(p => p._id === productId ? { ...p, quantity: newQuantity } : p)
        )
        return true
      } else {
        toast.error(response.data.message)
        return false
      }
    } catch (error) {
      console.log('Stock update error:', error)
      toast.error(error.response?.data?.message || error.message)
      return false
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
                      ? 'border-black text-black'
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
                      ? 'border-black text-black'
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
            onStockUpdate={updateProductStock}
            token={token}
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

// Stock Summary Card Component
const StockSummaryCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Product List View Component
const ProductListView = ({ products, onView, onEdit, onDelete, onStatusChange, onStockUpdate, token }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  
  // Fetch categories and create lookup maps
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/categories');
        console.log('Fetched categories for mapping:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          
          // Create category ID to name map
          const catMap = {};
          const subMap = {};
          
          response.data.forEach(category => {
            // Map by ID
            catMap[category._id] = category.name;
            
            // Also map by name (for backward compatibility)
            catMap[category.name] = category.name;
            
            // Map subcategories
            if (category.subcategories && Array.isArray(category.subcategories)) {
              category.subcategories.forEach(sub => {
                subMap[sub._id] = sub.name;
                subMap[sub.name] = sub.name; // For backward compatibility
              });
            }
          });
          
          setCategoriesMap(catMap);
          setSubcategoriesMap(subMap);
          
          console.log('Category Map:', catMap);
          console.log('Subcategory Map:', subMap);
        }
      } catch (error) {
        console.error('Error fetching categories for mapping:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Helper functions to get names from IDs
  const getCategoryName = (categoryIdOrName) => {
    if (!categoryIdOrName) return 'Uncategorized';
    
    // If it's already in our map, return it
    if (categoriesMap[categoryIdOrName]) {
      return categoriesMap[categoryIdOrName];
    }
    
    // If it looks like an ObjectId but not in map, it might be a deleted category
    if (typeof categoryIdOrName === 'string' && categoryIdOrName.match(/^[0-9a-fA-F]{24}$/)) {
      return 'Deleted Category';
    }
    
    // Return the value as is (might be a category name)
    return categoryIdOrName;
  };

  const getSubcategoryName = (subcategoryIdOrName) => {
    if (!subcategoryIdOrName) return 'Uncategorized';
    
    // If it's already in our map, return it
    if (subcategoriesMap[subcategoryIdOrName]) {
      return subcategoriesMap[subcategoryIdOrName];
    }
    
    // If it looks like an ObjectId but not in map, it might be a deleted subcategory
    if (typeof subcategoryIdOrName === 'string' && subcategoryIdOrName.match(/^[0-9a-fA-F]{24}$/)) {
      return 'Deleted Subcategory';
    }
    
    // Return the value as is (might be a subcategory name)
    return subcategoryIdOrName;
  };

  // Debug: Log what we're working with
  useEffect(() => {
    if (products.length > 0 && Object.keys(categoriesMap).length > 0) {
      console.log('=== PRODUCT CATEGORY MAPPING DEBUG ===');
      products.forEach(product => {
        console.log(`Product: ${product.name}`);
        console.log(`Category ID/Name: ${product.category}`);
        console.log(`Mapped Category: ${getCategoryName(product.category)}`);
        console.log(`Subcategory ID/Name: ${product.subcategory}`);
        console.log(`Mapped Subcategory: ${getSubcategoryName(product.subcategory)}`);
        console.log('---');
      });
    }
  }, [products, categoriesMap]);

  return (
    <div>
      {/* Temporary debug button - remove after testing */}
      <button 
        onClick={() => {
          console.log('=== CURRENT MAPPING STATE ===');
          console.log('Categories Map:', categoriesMap);
          console.log('Subcategories Map:', subcategoriesMap);
          products.forEach(p => {
            console.log(`Product: ${p.name}`, {
              category: p.category,
              mappedCategory: getCategoryName(p.category),
              subcategory: p.subcategory,
              mappedSubcategory: getSubcategoryName(p.subcategory)
            });
          });
        }}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Debug Mapping
      </button>

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
                            {getCategoryName(item.category)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Subcategory</span>
                          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full capitalize">
                            {getSubcategoryName(item.subcategory)}
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
                          <div className="flex items-center space-x-2">
                            <StockIndicator quantity={item.quantity} />
                          </div>
                        </div>
                        {item.totalSales > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Total Sales</span>
                            <span className="text-xs font-medium text-purple-600">
                              {item.totalSales} sold
                            </span>
                          </div>
                        )}
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
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subcategory</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sales</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8">
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
                        {getCategoryName(item.category)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full capitalize">
                        {getSubcategoryName(item.subcategory)}
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
                      <div className="flex items-center space-x-3">
                        <StockIndicator quantity={item.quantity} />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.totalSales > 0 ? (
                        <div className="flex items-center space-x-2">
                          <FaShoppingBag className="w-3 h-3 text-purple-500" />
                          <span className="text-sm text-gray-600">{item.totalSales}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusDropdown 
                        currentStatus={item.status || 'draft'} 
                        onStatusChange={(status) => onStatusChange(item._id, status)}
                      />
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
// Add this debug component at the top of your List.jsx file
const SafeRender = ({ value, fallback = 'N/A' }) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'object') {
    console.warn('Object detected in SafeRender:', value);
    // Try to extract meaningful information from the object
    if (value.name) return value.name;
    if (value._id) return value._id;
    if (value.title) return value.title;
    if (value.toString && typeof value.toString === 'function') {
      return value.toString();
    }
    return JSON.stringify(value);
  }
  
  return value;
};

// Then update the DealListView component to use SafeRender for all dynamic content
const DealListView = ({ deals, onView, onEdit, onDelete, onStatusChange }) => {
  // Debug: Check what's in the deals data
  console.log('Deals data:', deals);
  
  return (
    <div>
      {/* Mobile & Tablet Grid View */}
      <div className="lg:hidden">
        {deals.length === 0 ? (
          <EmptyState type="deals" />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {deals.map((item) => {
              // Debug each item
              console.log('Deal item:', item);
              
              return (
                <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="p-3">
                    <div className="flex items-start space-x-3">
                      <img 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" 
                        src={item.dealImages?.[0]} 
                        alt={item.dealName} 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                          <SafeRender value={item.dealName} />
                        </h3>
                        <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                          <SafeRender value={item.dealDescription} fallback="No description available" />
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Type</span>
                           // Replace the deal type display in both mobile and desktop views with:
<span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-full capitalize truncate max-w-20">
  {typeof item.dealType === 'object' ? item.dealType.name : (item.dealType || 'standard')}
</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Discount</span>
                            <span className="font-semibold text-green-600 text-sm">
                              {item.dealDiscountType === 'percentage' ? 
                                `${item.dealDiscountValue}%` : 
                                `${currency}${item.dealDiscountValue}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Products</span>
                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                              <SafeRender value={item.dealProducts?.length || 0} /> items
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <StatusDropdown 
                          currentStatus={item.status || 'draft'} 
                          onStatusChange={(status) => onStatusChange(item._id, status)}
                        />
                        <div className="text-xs text-gray-600">
                          <SafeRender value={new Date(item.dealStartDate).toLocaleDateString()} />
                          {item.dealEndDate && ` - ${new Date(item.dealEndDate).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <ActionButton
                          onClick={() => onView(item)}
                          variant="primary"
                          icon="view"
                          label="View"
                          fullWidth
                          size="sm"
                        />
                        <ActionButton
                          onClick={() => onEdit(item)}
                          variant="secondary"
                          icon="edit"
                          label="Edit"
                          fullWidth
                          size="sm"
                        />
                        <ActionButton
                          onClick={() => onDelete(item._id)}
                          variant="danger"
                          icon="delete"
                          label="Delete"
                          fullWidth
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Deal</th>
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 sm:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
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
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <img 
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg border border-gray-200" 
                          src={item.dealImages?.[0]} 
                          alt={item.dealName} 
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            <SafeRender value={item.dealName} />
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            <SafeRender value={item.dealDescription} />
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                     <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium capitalize">
  <FaFire className="w-3 h-3 mr-1" />
  {typeof item.dealType === 'object' ? item.dealType.name : (item.dealType || 'standard')}
</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-1">
                        {item.dealDiscountType === 'percentage' ? (
                          <FaPercentage className="w-3 h-3 text-green-500" />
                        ) : (
                          <FaDollarSign className="w-3 h-3 text-green-500" />
                        )}
                        <span className="font-semibold text-green-600 text-sm">
                          {item.dealDiscountType === 'percentage' ? 
                            `${item.dealDiscountValue}%` : 
                            `${currency}${item.dealDiscountValue}`
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <FaCube className="w-3 h-3 mr-1" />
                        <SafeRender value={item.dealProducts?.length || 0} /> products
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">
                            <SafeRender value={new Date(item.dealStartDate).toLocaleDateString()} />
                          </span>
                        </div>
                        {item.dealEndDate && (
                          <div className="flex items-center space-x-1">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">
                              <SafeRender value={new Date(item.dealEndDate).toLocaleDateString()} />
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <StatusDropdown 
                        currentStatus={item.status || 'draft'} 
                        onStatusChange={(status) => onStatusChange(item._id, status)}
                      />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-1 sm:space-x-2">
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

// Stock Indicator Component
const StockIndicator = ({ quantity }) => {
  const getStockConfig = (qty) => {
    if (qty === 0) return { color: 'bg-red-100 text-red-700', label: 'Out of Stock' };
    if (qty <= 5) return { color: 'bg-red-100 text-red-700', label: 'Very Low' };
    if (qty <= 10) return { color: 'bg-yellow-100 text-yellow-700', label: 'Low Stock' };
    if (qty <= 20) return { color: 'bg-blue-100 text-blue-700', label: 'Medium' };
    return { color: 'bg-green-100 text-green-700', label: 'In Stock' };
  };

  const config = getStockConfig(quantity);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`}></div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
        {quantity} {config.label}
      </span>
    </div>
  );
};

// Quick Stock Update Component
const QuickStockUpdate = ({ productId, currentQuantity, onUpdate, compact = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (newQuantity === currentQuantity) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    const success = await onUpdate(productId, newQuantity);
    setLoading(false);
    
    if (success) {
      setIsEditing(false);
    } else {
      setNewQuantity(currentQuantity);
    }
  };

  const handleCancel = () => {
    setNewQuantity(currentQuantity);
    setIsEditing(false);
  };

  const quickAdjust = async (adjustment) => {
    const newQty = Math.max(0, currentQuantity + adjustment);
    setLoading(true);
    await onUpdate(productId, newQty);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
    );
  }

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
          min="0"
        />
        <button
          onClick={handleSave}
          className="text-green-600 hover:text-green-800"
        >
          <FaCheckCircle className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="text-red-600 hover:text-red-800"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {!compact && (
        <>
          <button
            onClick={() => quickAdjust(-1)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            disabled={currentQuantity <= 0}
          >
            <FaMinus className="w-3 h-3" />
          </button>
          <button
            onClick={() => quickAdjust(1)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </>
      )}
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
      >
        Edit
      </button>
    </div>
  );
};

// Status Dropdown Component
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'text-gray-600' },
    { value: 'published', label: 'Published', color: 'text-green-600' },
  ]

  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors duration-200"
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
    primary: "bg-black text-white hover:bg-gray-800 focus:ring-black",
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
      <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200">
        Create {type.slice(0, -1)}
      </button>
    </div>
  </div>
)

export default List