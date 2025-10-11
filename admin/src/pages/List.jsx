import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
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
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

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
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-2">All Products List ({list.length} products)</p>
        </div>

        {/* Mobile Card View - Simplified */}
        <div className="md:hidden space-y-4">
          {list.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 mt-1">Add your first product to get started</p>
            </div>
          ) : (
            list.map((item) => (
              <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                {/* Changed to vertical flex layout */}
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
                        <span className="text-gray-500 text-xs mb-1">Original</span>
                        <span className="text-gray-400 line-through text-xs">{currency}{item.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
                  <button
                    onClick={() => removeProduct(item._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_0.5fr] items-center py-4 px-6 bg-gray-50 text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
            <span className="text-center">Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Original</span>
            <span>Quantity</span>
            <span className="text-center">Action</span>
          </div>

          {/* Product List */}
          <div className="divide-y divide-gray-200">
            {list.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-1">Add your first product to get started</p>
              </div>
            ) : (
              list.map((item) => (
                <div 
                  key={item._id} 
                  className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-4 py-4 px-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  {/* Image */}
                  <div className="flex justify-center">
                    <img 
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                      src={item.image[0]} 
                      alt={item.name} 
                    />
                  </div>
                  
                  {/* Name */}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Discount Price */}
                  <div>
                    <p className="font-semibold text-green-600 text-sm">{currency}{item.discountprice}</p>
                  </div>
                  
                  {/* Original Price */}
                  <div>
                    <p className="text-gray-400 line-through text-sm">{currency}{item.price}</p>
                  </div>
                  
                  {/* Quantity */}
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
                  
                  {/* Action */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => removeProduct(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                      title="Delete product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default List