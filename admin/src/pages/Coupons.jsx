import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faPlus,
  faEdit,
  faTrash,
  faCopy,
  faCheck,
  faSearch,
  faFilter,
  faPercent,
  faMoneyBillWave,
  faClock,
  faCalendarAlt,
  faUsers,
  faCoins,
  faSyncAlt,
  faTimes,
  faCheckCircle,
  faExclamationCircle,
  faHistory,
  faToggleOn,
  faToggleOff,
  faDice,
  faInfoCircle,
  faReceipt,
  faBoxOpen,
  faGlobe,
  faCheckSquare,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';

const Coupons = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountsGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, expired

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Product selection filter within modal
  const [productSearch, setProductSearch] = useState('');

  // Usage logs modal
  const [selectedCouponLogs, setSelectedCouponLogs] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // View specific products modal
  const [viewProductsCoupon, setViewProductsCoupon] = useState(null);
  const [isViewProductsOpen, setIsViewProductsOpen] = useState(false);

  // Copied state for feedback
  const [copiedCode, setCopiedCode] = useState('');

  // Form State
  const initialFormState = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountAmount: '',
    appliesTo: 'all', // 'all' | 'specific'
    applicableProducts: [], // array of product IDs
    minOrderAmount: '',
    maxDiscountAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    usageLimit: '',
    usageLimitPerUser: 1,
    isActive: true,
    isPublic: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch all coupons
  const fetchCoupons = useCallback(async () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/coupon/list`, {
        headers: { token: authToken },
      });
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        toast.error(res.data.message || 'Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(error.response?.data?.message || 'Error loading coupons');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch all products for selection
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (error) {
      console.error('Error loading products for coupons:', error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, [fetchCoupons, fetchProducts]);

  // Handle Copy Code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Generate random code helper
  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
  };

  // Open Create Modal
  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentCouponId(null);
    setFormData(initialFormState);
    setProductSearch('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (coupon) => {
    setIsEditing(true);
    setCurrentCouponId(coupon._id);
    const applicableIds = Array.isArray(coupon.applicableProducts)
      ? coupon.applicableProducts.map((p) => (typeof p === 'object' ? p._id : p))
      : [];

    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountAmount: coupon.discountAmount ?? '',
      appliesTo: coupon.appliesTo || 'all',
      applicableProducts: applicableIds,
      minOrderAmount: coupon.minOrderAmount ?? '',
      maxDiscountAmount: coupon.maxDiscountAmount ?? '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit ?? '',
      usageLimitPerUser: coupon.usageLimitPerUser ?? 1,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      isPublic: coupon.isPublic !== undefined ? coupon.isPublic : true,
    });
    setProductSearch('');
    setIsModalOpen(true);
  };

  // Toggle single product selection
  const handleToggleProduct = (productId) => {
    setFormData((prev) => {
      const exists = prev.applicableProducts.includes(productId);
      return {
        ...prev,
        applicableProducts: exists
          ? prev.applicableProducts.filter((id) => id !== productId)
          : [...prev.applicableProducts, productId],
      };
    });
  };

  // Select All Filtered Products
  const handleSelectAllFiltered = (filtered) => {
    const idsToAdd = filtered.map((p) => p._id);
    setFormData((prev) => ({
      ...prev,
      applicableProducts: Array.from(new Set([...prev.applicableProducts, ...idsToAdd])),
    }));
  };

  // Deselect All Products
  const handleDeselectAll = () => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: [],
    }));
  };

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (!formData.discountAmount || Number(formData.discountAmount) <= 0) {
      toast.error('Please enter a valid discount amount');
      return;
    }

    if (formData.discountType === 'percentage' && Number(formData.discountAmount) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    if (formData.appliesTo === 'specific' && formData.applicableProducts.length === 0) {
      toast.error('Please select at least one product for this specific coupon');
      return;
    }

    const authToken = token || localStorage.getItem('token');
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountAmount: Number(formData.discountAmount),
        appliesTo: formData.appliesTo,
        applicableProducts: formData.appliesTo === 'specific' ? formData.applicableProducts : [],
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount:
          formData.discountType === 'percentage' && formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : 1,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`${backendUrl}/api/coupon/update/${currentCouponId}`, payload, {
          headers: { token: authToken },
        });
      } else {
        res = await axios.post(`${backendUrl}/api/coupon/create`, payload, {
          headers: { token: authToken },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || (isEditing ? 'Coupon updated!' : 'Coupon created!'));
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        toast.error(res.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.message || 'Error saving coupon');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (coupon) => {
    const authToken = token || localStorage.getItem('token');
    try {
      const res = await axios.patch(
        `${backendUrl}/api/coupon/toggle-status/${coupon._id}`,
        {},
        { headers: { token: authToken } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon) => {
    const authToken = token || localStorage.getItem('token');
    if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      try {
        const res = await axios.delete(`${backendUrl}/api/coupon/delete/${coupon._id}`, {
          headers: { token: authToken },
        });
        if (res.data.success) {
          toast.success(res.data.message);
          fetchCoupons();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  // View Usage Logs
  const handleViewLogs = (coupon) => {
    setSelectedCouponLogs(coupon);
    setIsLogsModalOpen(true);
  };

  // View Applicable Products
  const handleViewProducts = (coupon) => {
    setViewProductsCoupon(coupon);
    setIsViewProductsOpen(true);
  };

  // Filtered Coupons for main table
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((coupon) => {
      // Search
      const matchesSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (coupon.description && coupon.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status
      if (statusFilter === 'active') {
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < now;
        return coupon.isActive && !isExpired;
      }
      if (statusFilter === 'inactive') {
        return !coupon.isActive;
      }
      if (statusFilter === 'expired') {
        return coupon.expiryDate && new Date(coupon.expiryDate) < now;
      }

      return true;
    });
  }, [coupons, searchQuery, statusFilter]);

  // Filtered Products for modal product picker
  const filteredProductsForModal = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

  // Helper to check if coupon is expired
  const isCouponExpired = (coupon) => {
    return coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-black text-white rounded-2xl shadow-sm">
              <FontAwesomeIcon icon={faTag} className="text-xl" />
            </span>
            Coupons & Discounts
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create coupons for all products or specific selected items (supports logged-in & guest users)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition shadow-sm"
            title="Refresh coupons"
          >
            <FontAwesomeIcon icon={faSyncAlt} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition font-medium shadow-md shadow-gray-200"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <FontAwesomeIcon icon={faTag} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCoupons}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Coupons</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCoupons}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Redemptions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRedemptions}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Discount Given</p>
            <p className="text-2xl font-bold text-gray-900">
              {currency} {stats.totalDiscountsGiven.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'All Coupons' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table / Grid */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
          <p className="text-gray-500 text-sm font-medium">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-2xl mb-4">
            <FontAwesomeIcon icon={faTag} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No coupons found</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search keywords or filter criteria.'
              : 'Create your first discount coupon to start offering special deals to customers.'}
          </p>
          <button
            onClick={openCreateModal}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Applies To</th>
                  <th className="py-4 px-6">Min Order / Cap</th>
                  <th className="py-4 px-6">Validity</th>
                  <th className="py-4 px-6">Usage</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => {
                  const expired = isCouponExpired(coupon);
                  const limitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
                  const specificCount = Array.isArray(coupon.applicableProducts)
                    ? coupon.applicableProducts.length
                    : 0;

                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50/60 transition group">
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-base bg-gray-100 text-gray-900 px-3 py-1 rounded-lg border border-gray-200 tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-gray-400 hover:text-black transition p-1"
                            title="Copy code"
                          >
                            <FontAwesomeIcon
                              icon={copiedCode === coupon.code ? faCheck : faCopy}
                              className={copiedCode === coupon.code ? 'text-green-600' : ''}
                            />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-sm px-2.5 py-1 rounded-lg ${
                              coupon.discountType === 'percentage'
                                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={coupon.discountType === 'percentage' ? faPercent : faMoneyBillWave}
                              className="text-xs"
                            />
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountAmount}% OFF`
                              : `${currency} ${coupon.discountAmount} OFF`}
                          </span>
                        </div>
                      </td>

                      {/* Product Scope */}
                      <td className="py-4 px-6">
                        {coupon.appliesTo === 'specific' && specificCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleViewProducts(coupon)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition cursor-pointer"
                            title="Click to view eligible products"
                          >
                            <FontAwesomeIcon icon={faBoxOpen} className="text-xs" />
                            <span>{specificCount} Specific Products</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium">
                            <FontAwesomeIcon icon={faGlobe} className="text-xs" />
                            <span>All Products</span>
                          </span>
                        )}
                      </td>

                      {/* Min Order / Cap */}
                      <td className="py-4 px-6">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p>
                            Min Order:{' '}
                            <span className="font-semibold text-gray-800">
                              {coupon.minOrderAmount > 0
                                ? `${currency} ${coupon.minOrderAmount}`
                                : 'None'}
                            </span>
                          </p>
                          {coupon.discountType === 'percentage' && (
                            <p>
                              Max Cap:{' '}
                              <span className="font-semibold text-gray-800">
                                {coupon.maxDiscountAmount
                                  ? `${currency} ${coupon.maxDiscountAmount}`
                                  : 'No cap'}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="py-4 px-6">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-[10px]" />
                            From: {new Date(coupon.startDate).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} className="text-gray-400 text-[10px]" />
                            Until:{' '}
                            {coupon.expiryDate ? (
                              <span
                                className={expired ? 'text-red-600 font-semibold' : 'text-gray-800'}
                              >
                                {new Date(coupon.expiryDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">Never Expires</span>
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-medium">
                              {coupon.usedCount || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'used'}
                            </span>
                            {coupon.usedCount > 0 && (
                              <button
                                onClick={() => handleViewLogs(coupon)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-[11px] underline ml-2"
                              >
                                History
                              </button>
                            )}
                          </div>
                          {coupon.usageLimit ? (
                            <div className="w-28 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  limitReached
                                    ? 'bg-red-500'
                                    : (coupon.usedCount / coupon.usageLimit) > 0.8
                                    ? 'bg-amber-500'
                                    : 'bg-black'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((coupon.usedCount || 0) / coupon.usageLimit) * 100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">Unlimited limit</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className="text-2xl transition focus:outline-none"
                            title={coupon.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            <FontAwesomeIcon
                              icon={coupon.isActive ? faToggleOn : faToggleOff}
                              className={coupon.isActive ? 'text-emerald-500' : 'text-gray-300'}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              expired
                                ? 'bg-red-50 text-red-600'
                                : limitReached
                                ? 'bg-amber-50 text-amber-700'
                                : coupon.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {expired
                              ? 'Expired'
                              : limitReached
                              ? 'Limit Full'
                              : coupon.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                            title="Edit coupon"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete coupon"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black text-white rounded-2xl">
                  <FontAwesomeIcon icon={faTag} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isEditing
                      ? 'Update promotional discount rules and product scope'
                      : 'Define discount rules, choose applicable products and set limits'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Code with Generator */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. SUMMER25, CLAY10"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="flex-1 uppercase font-mono font-bold px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-xs transition"
                    title="Generate Random Code"
                  >
                    <FontAwesomeIcon icon={faDice} />
                    <span>Auto Generate</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Description / Promo Label
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. 20% off on all ceramic items"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                />
              </div>

              {/* Discount Type & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm font-medium"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Discount (Rs.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discountAmount"
                      required
                      min="1"
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                      value={formData.discountAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition font-semibold text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      {formData.discountType === 'percentage' ? '%' : currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* APPLICABLE PRODUCTS SCOPE */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-800 mb-2">
                  Applicable Products Scope
                </label>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, appliesTo: 'all' }))}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition ${
                      formData.appliesTo === 'all'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>All Products</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, appliesTo: 'specific' }))}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition ${
                      formData.appliesTo === 'specific'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faBoxOpen} />
                    <span>Specific Products ({formData.applicableProducts.length})</span>
                  </button>
                </div>

                {/* If Specific Products: Product Selection Box */}
                {formData.appliesTo === 'specific' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Search product name or category..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectAllFiltered(filteredProductsForModal)}
                          className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium text-gray-800 transition"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-medium text-gray-800 transition"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-100 p-1">
                      {filteredProductsForModal.length === 0 ? (
                        <p className="p-4 text-xs text-gray-400 text-center">No products match your search.</p>
                      ) : (
                        filteredProductsForModal.map((product) => {
                          const isSelected = formData.applicableProducts.includes(product._id);
                          return (
                            <div
                              key={product._id}
                              onClick={() => handleToggleProduct(product._id)}
                              className={`p-2.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition ${
                                isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <FontAwesomeIcon
                                  icon={isSelected ? faCheckSquare : faSquare}
                                  className={`text-base ${
                                    isSelected ? 'text-black' : 'text-gray-300'
                                  }`}
                                />
                                {product.image && product.image[0] ? (
                                  <img
                                    src={product.image[0]}
                                    alt=""
                                    className="w-9 h-9 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                    <FontAwesomeIcon icon={faBoxOpen} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-[11px] text-gray-500">
                                    {product.category || 'General'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-gray-800 flex-shrink-0">
                                {currency} {product.price}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {formData.applicableProducts.length} product(s) selected for this promotion.
                    </p>
                  </div>
                )}
              </div>

              {/* Minimum Order Amount & Max Discount Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Min Order Subtotal ({currency})
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    min="0"
                    placeholder="0 for no minimum"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Required cart subtotal to apply
                  </span>
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Max Discount Cap ({currency})
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      min="0"
                      placeholder="Leave blank for no cap"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Maximum savings cap for %
                    </span>
                  </div>
                )}
              </div>

              {/* Start Date & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Leave blank if it never expires
                  </span>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Total Usage Limit (Overall)
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    min="1"
                    placeholder="e.g. 100 (Blank = Unlimited)"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Usage Limit Per Customer
                  </label>
                  <input
                    type="number"
                    name="usageLimitPerUser"
                    min="1"
                    value={formData.usageLimitPerUser}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition text-sm"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Uses allowed per user or guest email
                  </span>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Active immediately</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show in Available Deals list
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition shadow-md shadow-gray-200 disabled:opacity-50"
                >
                  {isSaving && <FontAwesomeIcon icon={faSyncAlt} className="animate-spin" />}
                  <span>{isEditing ? 'Update Coupon' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SPECIFIC PRODUCTS MODAL */}
      {isViewProductsOpen && viewProductsCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Eligible Products ({viewProductsCoupon.code})
                  </h3>
                  <p className="text-xs text-gray-500">
                    This coupon only discounts the following items
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewProductsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {viewProductsCoupon.applicableProducts &&
              viewProductsCoupon.applicableProducts.length > 0 ? (
                viewProductsCoupon.applicableProducts.map((prod, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {prod.image && prod.image[0] ? (
                        <img
                          src={prod.image[0]}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          <FontAwesomeIcon icon={faBoxOpen} />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          {typeof prod === 'object' ? prod.name : prod}
                        </p>
                        {prod.category && (
                          <p className="text-[11px] text-gray-500">{prod.category}</p>
                        )}
                      </div>
                    </div>
                    {prod.price && (
                      <span className="text-xs font-semibold text-gray-800">
                        {currency} {prod.price}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-gray-400">No product records attached.</p>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsViewProductsOpen(false)}
                className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USAGE LOGS MODAL */}
      {isLogsModalOpen && selectedCouponLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <FontAwesomeIcon icon={faHistory} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Usage History: {selectedCouponLogs.code}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Total Redemptions: {selectedCouponLogs.usedCount || 0} times
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>

            {selectedCouponLogs.usedBy && selectedCouponLogs.usedBy.length > 0 ? (
              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Customer Email</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Discount Applied</th>
                      <th className="py-3 px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedCouponLogs.usedBy.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {entry.email || 'Guest User'}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {entry.orderId ? `#${entry.orderId.slice(-6)}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          {currency} {Number(entry.discountApplied || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {entry.usedAt
                            ? new Date(entry.usedAt).toLocaleString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <FontAwesomeIcon icon={faReceipt} className="text-3xl mb-2" />
                <p className="text-sm">No redemption records yet for this coupon.</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
