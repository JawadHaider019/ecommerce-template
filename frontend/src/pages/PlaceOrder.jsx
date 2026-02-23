import React from 'react';
import { useState, useContext, useEffect, useCallback } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from "react-router-dom"; 
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from "../assets/assets";
import LoginModal from '../components/Login';

const PlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUserDataLoaded, setHasUserDataLoaded] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [pakistanStates, setPakistanStates] = useState([]);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [cityZipData, setCityZipData] = useState({});
  const [knownCitiesWithZips, setKnownCitiesWithZips] = useState({});
  
  // Add state for category mappings
  const [categoryIdMap, setCategoryIdMap] = useState({});
  const [subcategoryIdMap, setSubcategoryIdMap] = useState({});
  
  // Payment States - COD Only
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Guest checkout states
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  
  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const {
    backendUrl,
    token,
    user,
    cartItems,
    cartDeals,
    setCartItems,
    setCartDeals,
    getDeliveryCharge,
    getCartAmount,
    products,
    deals,
    currency,
    clearCart
  } = useContext(ShopContext);
  
  const navigate = useNavigate();

  // Fetch categories to build ID-to-name mapping
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categories`);
        const data = response.data;
        
        let categories = data.data || data.categories || data;
        if (!Array.isArray(categories)) return;

        const idToNameMap = {};
        const subcategoryIdToNameMap = {};

        categories.forEach((cat) => {
          const categoryId = cat._id || cat.id;
          const categoryName = cat.name || cat.categoryName || cat.title || 'Category';

          if (categoryId) idToNameMap[categoryId] = categoryName;

          const subcategories = cat.subcategories || cat.subCategories || [];
          subcategories.forEach((sub) => {
            const subcategoryId = sub._id || sub.id;
            const subcategoryName = sub.name || sub.subcategoryName || sub.title || sub || 'Subcategory';
            if (subcategoryId) subcategoryIdToNameMap[subcategoryId] = subcategoryName;
          });
        });

        setCategoryIdMap(idToNameMap);
        setSubcategoryIdMap(subcategoryIdToNameMap);
      } catch (error) {
        // Silently handle error
      }
    };

    fetchCategories();
  }, [backendUrl]);

  // Form data state
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('orderFormData');
    
    // Base default data with all fields
    const defaultData = {
      fullName: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      phone: ''
    };
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Merge saved data with defaults to ensure all fields exist
      return {
        ...defaultData,
        ...parsedData
      };
    }
    
    // If user is logged in, pre-fill with their data
    if (user?.name && user?.email) {
      defaultData.fullName = user.name || '';
      defaultData.email = user.email || '';
      defaultData.phone = user.phone || '';
    }
    
    return defaultData;
  });

  // Get total amount using the same logic as CartTotal
  const calculateTotalAmount = () => {
    try {
      const subtotal = getCartAmount?.() || 0;
      const deliveryCharge = getDeliveryCharge?.(subtotal) || 0;
      return subtotal + deliveryCharge;
    } catch (error) {
      return 0;
    }
  };

  const totalAmount = calculateTotalAmount();

  // Check if user is logged in or not
  useEffect(() => {
    const checkAuth = () => {
      if (!token || !user) {
        setIsGuestCheckout(true);
        setShowGuestForm(true);
      } else {
        setIsGuestCheckout(false);
        setShowGuestForm(false);
      }
    };
    
    checkAuth();
  }, [token, user]);

  // Load user data as defaults for logged-in users
  useEffect(() => {
    if (user?.name && user?.email && !hasUserDataLoaded && !isGuestCheckout) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || prev.phone
      }));
      setHasUserDataLoaded(true);
    }
  }, [user, hasUserDataLoaded, isGuestCheckout]);

  // For guest users, pre-fill from localStorage if available
  useEffect(() => {
    if (isGuestCheckout) {
      const savedGuestData = localStorage.getItem('guestCheckoutData');
      if (savedGuestData) {
        const data = JSON.parse(savedGuestData);
        setFormData(prev => ({
          ...prev,
          fullName: data.fullName || prev.fullName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone
        }));
        setGuestName(data.fullName || '');
        setGuestEmail(data.email || '');
        setGuestPhone(data.phone || '');
      }
    }
  }, [isGuestCheckout]);

  // Save guest data to localStorage
  useEffect(() => {
    if (isGuestCheckout && formData.email) {
      const guestData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      };
      localStorage.setItem('guestCheckoutData', JSON.stringify(guestData));
    }
  }, [isGuestCheckout, formData.fullName, formData.email, formData.phone]);

  // Load Pakistan states
  useEffect(() => {
    const loadPakistanStates = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/locations/pakistan/states`);
        if (response.data.success) {
          setPakistanStates(response.data.data.states.map(state => state.name));
        }
      } catch (error) {
        setPakistanStates(['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan']);
      }
    };
    
    if (backendUrl) {
      loadPakistanStates();
    }
  }, [backendUrl]);

  // Fetch cities with ZIP codes
  const fetchCitiesByState = useCallback(async (stateName) => {
    if (!stateName) {
      setCities([]);
      setCityZipData({});
      setKnownCitiesWithZips({});
      return;
    }

    setIsLoadingCities(true);
    try {
      const response = await axios.get(`${backendUrl}/api/locations/cities`, {
        params: { state: stateName }
      });

      if (response.data.success) {
        const citiesData = response.data.data.cities;
        
        if (citiesData.length > 0) {
          const cityNames = citiesData.map(city => city.name).sort();
          setCities(cityNames);
          
          // Create city-zip mapping
          const zipMapping = {};
          const knownCities = {};
          
          citiesData.forEach(city => {
            if (city.name && city.zipCode && city.zipCode !== 'N/A') {
              zipMapping[city.name] = city.zipCode;
              knownCities[city.name] = {
                zipCode: city.zipCode,
                state: stateName
              };
            }
          });
          
          setCityZipData(zipMapping);
          setKnownCitiesWithZips(knownCities);
        }
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoadingCities(false);
    }
  }, [backendUrl]);

  // Auto-fill ZIP code
  const autoFillZipCode = useCallback((cityName) => {
    if (cityName && cityZipData[cityName] && !formData.zipcode) {
      setFormData(prev => ({
        ...prev,
        zipcode: cityZipData[cityName]
      }));
      
      if (validationErrors.zipcode) {
        setValidationErrors(prev => ({ ...prev, zipcode: '' }));
      }
    }
  }, [cityZipData, formData.zipcode, validationErrors.zipcode]);

  // Validate address
  const validateAddress = useCallback(async (city, state, zipcode) => {
    if (!city || !state) return { isValid: false, message: 'City and state are required' };

    try {
      const response = await axios.post(`${backendUrl}/api/locations/validate-city-zip`, {
        city, state, zipCode: zipcode, country: 'Pakistan'
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        // Even if validation fails, allow the order with manual verification
        if (city && state && zipcode && /^\d{5}$/.test(zipcode)) {
          return { 
            isValid: true, 
            message: 'Address accepted with manual verification',
            requiresManualVerification: true
          };
        }
        // Even if basic validation fails, still allow with warning
        return { 
          isValid: true, 
          message: 'Address will be manually verified',
          requiresManualVerification: true
        };
      }
    } catch (error) {
      // If API fails, always allow the order
      return { 
        isValid: true, 
        message: 'Address accepted (validation service unavailable)',
        requiresManualVerification: true
      };
    }
  }, [backendUrl]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.state) {
      fetchCitiesByState(formData.state);
    } else {
      setCities([]);
      setCityZipData({});
      setKnownCitiesWithZips({});
    }
  }, [formData.state, fetchCitiesByState]);

  // Auto-fill ZIP code when city changes
  useEffect(() => {
    if (formData.city && cityZipData[formData.city] && !formData.zipcode) {
      autoFillZipCode(formData.city);
    }
  }, [formData.city, formData.zipcode, cityZipData, autoFillZipCode]);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem('orderFormData', JSON.stringify(formData));
  }, [formData]);

  // Enhanced data readiness check
  useEffect(() => {
    const hasCartItems = (cartItems && Object.keys(cartItems).length > 0) || 
                        (cartDeals && Object.keys(cartDeals).length > 0);
    
    const hasProductsData = products !== undefined && products !== null;
    const hasDealsData = deals !== undefined && deals !== null;
    
    const ready = hasProductsData && hasDealsData;

    setIsDataReady(ready);
  }, [cartItems, cartDeals, products, deals]);

  // Address suggestions
  const fetchAddressSuggestions = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const GEOAPIFY_API_KEY = '2d3f1042c3f94233a2e3347a80ad8c27';
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: `${query}, Pakistan`,
            filter: `countrycode:pk`,
            format: 'json',
            apiKey: GEOAPIFY_API_KEY,
            limit: 5
          }
        }
      );

      const suggestions = (response.data?.results || []).map(item => ({
        fullAddress: item.formatted || '',
        street: item.street || item.address_line1 || '',
        city: item.city || item.municipality || '',
        state: item.state || item.region || '',
        zipcode: item.postcode || '',
        country: item.country || ''
      })).filter(suggestion => suggestion.fullAddress);

      setAddressSuggestions(suggestions);
    } catch (error) {
      setAddressSuggestions([]);
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  // Field validation
  const validateField = async (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'fullName':
        if (!value?.trim()) errors.fullName = 'Customer name is required';
        else if (value.trim().length < 2) errors.fullName = 'Customer name must be at least 2 characters';
        else if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) errors.fullName = 'Customer name can only contain letters and spaces';
        break;
        
      case 'email':
        if (!value?.trim()) errors.email = 'Customer email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email address';
        break;
        
      case 'street':
        if (!value?.trim()) errors.street = 'Street address is required';
        else if (value.trim().length < 5) errors.street = 'Please enter a complete street address';
        break;
        
      case 'city':
        if (!value?.trim()) errors.city = 'City is required';
        break;
        
      case 'state':
        if (!value?.trim()) errors.state = 'Province is required';
        else if (!pakistanStates.includes(value)) errors.state = 'Please select a valid province';
        break;
        
      case 'zipcode':
        if (!value?.trim()) errors.zipcode = 'ZIP code is required';
        else if (!/^\d{5}$/.test(value.trim())) errors.zipcode = 'ZIP code must be 5 digits';
        break;
        
      case 'phone':
        if (!value?.trim()) {
          errors.phone = 'Whatsapp number is required';
        } else {
          const digitsOnly = value.replace(/\D/g, '');
          if (!/^03\d{9}$/.test(digitsOnly)) {
            errors.phone = 'Please enter a valid Pakistani number (03XXXXXXXXX)';
          }
        }
        break;
    }
    
    return errors;
  };

  const validateForm = async () => {
    const errors = {};
    
    // Validate all form fields
    for (const field of Object.keys(formData)) {
      const fieldErrors = await validateField(field, formData[field]);
      Object.assign(errors, fieldErrors);
    }
    
    setValidationErrors(errors);
    
    // Allow submission even if there are ZIP code errors (they're just warnings now)
    const blockingErrors = { ...errors };
    delete blockingErrors.zipcode; // Remove ZIP code errors from blocking validation
    
    return Object.keys(blockingErrors).length === 0;
  };

  const onChangeHandler = async (e) => {
    const { name, value } = e.target;
    
    // Format phone number
    let formattedValue = value;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      formattedValue = digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4, 11)}` : digits;
    }
    
    // Don't allow numbers in name fields
    if ((name === 'fullName' || name === 'city') && /\d/.test(value)) return;
    
    // Clear city and zipcode when state changes
    if (name === 'state' && value !== formData.state) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        city: '',
        zipcode: ''
      }));
      setKnownCitiesWithZips({});
    } else {
      setFormData(prev => ({ ...prev, [name]: formattedValue || value }));
    }
    
    // Auto-fill ZIP code only for known cities
    if (name === 'city' && value && cityZipData[value] && !formData.zipcode) {
      setTimeout(() => autoFillZipCode(value), 100);
    }
    
    // Address suggestions
    if (name === 'street') {
      if (value.length >= 3) {
        setShowSuggestions(true);
        fetchAddressSuggestions(value);
      } else {
        setAddressSuggestions([]);
      }
    }
    
    // Real-time ZIP validation
    if (name === 'zipcode' && value.length === 5 && /^\d{5}$/.test(value)) {
      setValidationErrors(prev => ({
        ...prev,
        zipcode: ''
      }));
    }
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Update guest state if needed
    if (isGuestCheckout) {
      if (name === 'fullName') setGuestName(value);
      if (name === 'email') setGuestEmail(value);
      if (name === 'phone') setGuestPhone(value);
    }
  };

  const onBlurHandler = async (e) => {
    const { name, value } = e.target;
    const errors = await validateField(name, value);
    setValidationErrors(prev => ({ ...prev, ...errors }));
  };

  const selectAddressSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      street: suggestion.street || prev.street,
      city: suggestion.city || prev.city,
      state: suggestion.state || prev.state,
      zipcode: suggestion.zipcode || prev.zipcode
    }));
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // Cart processing
  const getDealProducts = (deal) => {
    if (deal.dealProducts?.length > 0) {
      return deal.dealProducts.map(product => {
        const productData = products.find(p => p._id === product._id) || product;
        return { ...productData, quantity: product.quantity || 1 };
      });
    }
    return [];
  };

  // Helper function to extract category name using the category mappings
  const getCategoryName = (productInfo) => {
    // If category doesn't exist, return default
    if (!productInfo.category) return 'Product';
    
    // If category is an object with a name property
    if (typeof productInfo.category === 'object' && productInfo.category !== null) {
      if (productInfo.category.name) {
        return productInfo.category.name;
      }
      return 'Product';
    }
    
    // If category is a string
    if (typeof productInfo.category === 'string') {
      const categoryString = productInfo.category;
      
      // Check if it looks like a MongoDB ID (24 hex characters)
      const isMongoId = /^[0-9a-f]{24}$/i.test(categoryString);
      
      if (isMongoId) {
        // Try to get from categoryIdMap first (from fetched categories)
        if (categoryIdMap[categoryString]) {
          return categoryIdMap[categoryString];
        }
        
        // Try to get from categoryName field
        if (productInfo.categoryName) {
          return productInfo.categoryName;
        }
        
        return 'Product';
      }
      
      // If it contains "Product" and looks like it has an ID, clean it
      if (categoryString.includes('Product') && categoryString.length > 10) {
        return 'Product';
      }
      
      // Try to clean any IDs from the string
      const words = categoryString.split(' ');
      const lastWord = words[words.length - 1];
      if (lastWord && /^[0-9a-f]{24}$/i.test(lastWord)) {
        words.pop();
        return words.join(' ') || 'Product';
      }
      
      // Return the category string if it's not an ID
      return categoryString;
    }
    
    return 'Product';
  };

  // Helper function to get subcategory name
  const getSubcategoryName = (productInfo) => {
    if (!productInfo.subcategory) return '';
    
    if (typeof productInfo.subcategory === 'object' && productInfo.subcategory !== null) {
      if (productInfo.subcategory.name) {
        return productInfo.subcategory.name;
      }
      return '';
    }
    
    if (typeof productInfo.subcategory === 'string') {
      const subcategoryString = productInfo.subcategory;
      const isMongoId = /^[0-9a-f]{24}$/i.test(subcategoryString);
      
      if (isMongoId) {
        if (subcategoryIdMap[subcategoryString]) {
          return subcategoryIdMap[subcategoryString];
        }
        if (productInfo.subcategoryName) {
          return productInfo.subcategoryName;
        }
        return '';
      }
      
      return subcategoryString;
    }
    
    return '';
  };

  // Process cart items for order
  const processCartItems = () => {
    let orderItems = [];
    let calculatedAmount = 0;

    // Process regular products
    if (cartItems && products) {
      Object.entries(cartItems).forEach(([itemId, quantity]) => {
        if (quantity > 0) {
          const productInfo = products.find(product => product._id === itemId);
          if (productInfo?.name) {
            const unitPrice = productInfo.discountprice > 0 ? productInfo.discountprice : productInfo.price;
            const itemTotal = unitPrice * quantity;
            
            // Get proper category and subcategory names
            const categoryName = getCategoryName(productInfo);
            const subcategoryName = getSubcategoryName(productInfo);
            
            orderItems.push({
              id: productInfo._id,
              name: productInfo.name,
              price: unitPrice,
              quantity: quantity,
              image: productInfo.image?.[0] || assets.placeholder_image,
              category: categoryName,
              subcategory: subcategoryName,
              isFromDeal: false,
              description: productInfo.description,
              originalPrice: productInfo.price,
              hasDiscount: productInfo.discountprice > 0
            });
            
            calculatedAmount += itemTotal;
          }
        }
      });
    }

    // Process deals using the same structure as cart
    if (cartDeals && deals) {
      Object.entries(cartDeals).forEach(([dealId, dealQuantity]) => {
        if (dealQuantity > 0) {
          const dealInfo = deals.find(deal => deal._id === dealId);
          if (dealInfo?.dealName) {
            const unitPrice = dealInfo.dealFinalPrice || dealInfo.price;
            const itemTotalPrice = unitPrice * dealQuantity;
            const originalTotalPrice = dealInfo.dealTotal;
            const savings = originalTotalPrice ? (originalTotalPrice - unitPrice) : 0;
            
            orderItems.push({
              id: dealInfo._id,
              name: dealInfo.dealName,
              price: unitPrice,
              quantity: dealQuantity,
              image: dealInfo.dealImages?.[0] || assets.placeholder_image,
              category: 'Deal',
              isFromDeal: true,
              description: dealInfo.dealDescription,
              originalTotalPrice: dealInfo.dealTotal,
              savings: savings,
              dealProducts: getDealProducts(dealInfo),
              type: 'deal'
            });
            
            calculatedAmount += itemTotalPrice;
          }
        }
      });
    }

    return { orderItems, calculatedAmount };
  };

  // Handle user login for checkout
  const handleLoginForCheckout = () => {
    setAuthMode('login');
    setIsLoginModalOpen(true);
  };

  // Handle guest checkout
  const handleGuestCheckout = () => {
    setShowGuestForm(true);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsGuestCheckout(false);
    setShowGuestForm(false);
  };

  // ✅ NEW: Clear cart function that works for both guest and logged-in users
  const forceClearCart = () => {
    // Clear React state
    setCartItems({});
    setCartDeals({});
    
    // Clear localStorage
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartDeals');
    localStorage.removeItem('guestCheckoutData');
    
    // Call context clearCart if available (for logged-in users)
    if (clearCart) {
      clearCart();
    }
    
    console.log('✅ Cart cleared after order placement');
  };

  // Main submit handler - supports both guest and logged-in
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Explicit phone validation before anything else
    if (!formData.phone || !formData.phone.trim()) {
      toast.error('Whatsapp number is required');
      setValidationErrors(prev => ({ 
        ...prev, 
        phone: 'Whatsapp number is required' 
      }));
      return;
    }
    
    // Validate phone format
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!/^03\d{9}$/.test(digitsOnly)) {
      toast.error('Please enter a valid Whatsapp number');
      setValidationErrors(prev => ({ 
        ...prev, 
        phone: 'Please enter a valid Pakistani number (03XXXXXXXXX)' 
      }));
      return;
    }
    
    if (isGuestCheckout && !showGuestForm) {
      // Show guest form if not shown yet
      setShowGuestForm(true);
      return;
    }
    
    if (!await validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    if (!isDataReady) {
      toast.error('Cart data is still loading. Please wait...');
      return;
    }

    setLoading(true);
    
    try {
      // Validate address but don't block on failure
      setIsValidatingAddress(true);
      const addressValidation = await validateAddress(formData.city, formData.state, formData.zipcode);
      
      // Show warning but don't block submission
      if (!addressValidation.isValid) {
        toast.warning('Address may need manual verification: ' + addressValidation.message);
      } else if (addressValidation.requiresManualVerification) {
        toast.warning('Your address will be manually verified for delivery');
      }

      const { orderItems, calculatedAmount } = processCartItems();
      const deliveryCharge = getDeliveryCharge(calculatedAmount);
      const finalAmount = calculatedAmount + deliveryCharge;

      if (orderItems.length === 0) {
        toast.error('Your cart is empty');
        setLoading(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items: orderItems,
        amount: finalAmount,
        address: formData,
        deliveryCharges: deliveryCharge,
        customerDetails: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: digitsOnly
        },
        paymentMethod: 'COD',
        paymentStatus: 'verified'
      };

      // Determine API endpoint and headers based on checkout type
      let apiEndpoint;
      let requestHeaders = {
        'Content-Type': 'application/json'
      };

      if (isGuestCheckout) {
        // Guest checkout - no token required
        apiEndpoint = `${backendUrl}/api/order/place`;
      } else {
        // Logged-in user - token required
        if (!token) {
          toast.error('Please login to continue');
          setIsLoginModalOpen(true);
          setAuthMode('login');
          setLoading(false);
          return;
        }
        apiEndpoint = `${backendUrl}/api/order/place`;
        requestHeaders.token = token;
      }

      // Submit order
      const response = await axios.post(apiEndpoint, orderData, {
        headers: requestHeaders
      });
      
      if (response.data.success) {
        // ✅ FORCE CLEAR CART FOR ALL USERS (both guest and logged-in)
        forceClearCart();
        
        // Clear form data
        localStorage.removeItem('orderFormData');
        
        // Save guest order info for tracking
        if (isGuestCheckout) {
          // Prepare COMPLETE order data for localStorage with proper category
          const completeGuestOrder = {
            _id: response.data.orderId,
            userId: null,
            items: orderItems.map(item => ({
              id: item.id || item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || assets.placeholder_image,
              category: item.category,
              subcategory: item.subcategory,
              isFromDeal: item.isFromDeal || false,
              dealImage: item.dealImage,
              originalTotalPrice: item.originalTotalPrice,
              savings: item.savings,
              description: item.description
            })),
            amount: finalAmount,
            deliveryCharges: deliveryCharge,
            address: {
              street: formData.street.trim(),
              city: formData.city.trim(),
              state: formData.state,
              zipcode: formData.zipcode.trim()
            },
            paymentMethod: 'COD',
            payment: false,
            status: 'Order Placed',
            date: Date.now(),
            customerDetails: {
              name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: digitsOnly
            },
            isGuest: true,
            isRecent: true
          };
          
          // Save to localStorage for immediate display
          localStorage.setItem('recentGuestOrder', JSON.stringify(completeGuestOrder));
          
          // Also save to guestOrders list for persistence
          const existingGuestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
          const updatedGuestOrders = [completeGuestOrder, ...existingGuestOrders.filter(o => o._id !== completeGuestOrder._id)];
          localStorage.setItem('guestOrders', JSON.stringify(updatedGuestOrders));
          
          // Save guest info for backend sync
          localStorage.setItem('guestOrderInfo', JSON.stringify({
            email: formData.email.trim(),
            phone: digitsOnly,
            timestamp: Date.now(),
            customerName: formData.fullName.trim()
          }));
          
          // Show guest success message
          toast.success(
            <div>
              <p>Order placed successfully</p>
            </div>
          );
          
          // Navigate to guest tracking page
          navigate('/orders', { 
            state: { 
              orderId: response.data.orderId,
              guestId: response.data.guestId,
              email: orderData.customerDetails.email
            } 
          });
        } else {
          // For logged-in users
          toast.success(
            <div>
              <div className="font-semibold">🎉 Order Placed Successfully!</div>
              <div className="text-sm mt-1">
                Your order #<span className="font-medium">{response.data.orderId.slice(-6)}</span> has been placed.
              </div>
            </div>
          );
          navigate('/orders');
        }
      } else {
        toast.error(response.data.message || 'Failed to place order');
      }
      
      setLoading(false);
      setIsValidatingAddress(false);

    } catch (error) {
      console.error('Order placement error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection.');
      } else if (error.response?.status === 401 && !isGuestCheckout) {
        // For logged-in users who got unauthorized
        setIsLoginModalOpen(true);
        setAuthMode('login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
      setLoading(false);
      setIsValidatingAddress(false);
    }
  };

  // Check if cart is empty
  const cartItemCount = (cartItems ? Object.keys(cartItems).length : 0) + 
                       (cartDeals ? Object.keys(cartDeals).length : 0);

  if (cartItemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-gray-600">🛒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to your cart before placing an order.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-8 py-3 rounded-3xl font-medium hover:bg-gray-800 transition-colors w-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Render methods with clean, simple styling
  const renderInputField = (name, type = 'text', placeholder, label, required = true) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        name={name} 
        value={formData[name] || ''} 
        className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
          validationErrors[name] 
            ? 'border-red-500 bg-red-50' 
            : 'bg-white hover:border-gray-400'
        }`} 
        type={type}
        placeholder={placeholder}
        required={required}
      />
      {validationErrors[name] && (
        <p className="text-red-600 text-sm mt-2">
          {validationErrors[name]}
        </p>
      )}
    </div>
  );

  const renderSelectField = (name, options, placeholder, label, required = true) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        name={name}
        value={formData[name] || ''}
        className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
          validationErrors[name] 
            ? 'border-red-500 bg-red-50' 
            : 'bg-white hover:border-gray-400'
        }`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {validationErrors[name] && (
        <p className="text-red-600 text-sm mt-2">
          {validationErrors[name]}
        </p>
      )}
    </div>
  );

  const renderCityInput = () => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        City <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          name="city"
          value={formData.city || ''}
          list="city-suggestions"
          className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
            validationErrors.city 
              ? 'border-red-500 bg-red-50' 
              : 'bg-white hover:border-gray-400'
          } ${!formData.state ? 'opacity-50 cursor-not-allowed' : ''}`}
          type="text"
          placeholder={formData.state ? "Select from list or type your city" : "Select province first"}
          required
          disabled={!formData.state}
        />
        
        {isLoadingCities && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          </div>
        )}
      </div>
      
      <datalist id="city-suggestions">
        {cities.map(city => (
          <option key={city} value={city} />
        ))}
      </datalist>
      
      {validationErrors.city && (
        <p className="text-red-600 text-sm mt-2">
          {validationErrors.city}
        </p>
      )}
    </div>
  );

  const renderZipCodeInput = () => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ZIP Code <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input 
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          name="zipcode" 
          value={formData.zipcode || ''} 
          className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
            validationErrors.zipcode 
              ? 'border-yellow-500 bg-yellow-50' 
              : 'bg-white hover:border-gray-400'
          }`} 
          type="number"
          placeholder="5-digit ZIP code"
          required
        />
        {formData.zipcode && cityZipData[formData.city] === formData.zipcode && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        )}
      </div>
      {validationErrors.zipcode && (
        <p className="text-yellow-600 text-sm mt-2">
          ⚠️ {validationErrors.zipcode} - Order can still be placed
        </p>
      )}
      {formData.zipcode && /^\d{5}$/.test(formData.zipcode) && !validationErrors.zipcode && (
        <p className="text-green-600 text-sm mt-2">
          ✓ Valid ZIP code format
        </p>
      )}
    </div>
  );

  const renderAddressInput = () => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Street Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input 
          onChange={onChangeHandler}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => formData.street?.length >= 3 && setShowSuggestions(true)}
          name="street" 
          value={formData.street || ''} 
          className={`w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
            validationErrors.street 
              ? 'border-red-500 bg-red-50' 
              : 'bg-white hover:border-gray-400'
          }`} 
          type="text"
          placeholder="House number, street, area"
          required
        />
        
        {isSearchingAddress && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          </div>
        )}
        
        {showSuggestions && addressSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-3xl shadow-lg max-h-48 overflow-y-auto">
            {addressSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => selectAddressSuggestion(suggestion)}
              >
                <div className="font-medium text-sm text-gray-900">
                  {suggestion.fullAddress}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {validationErrors.street && (
        <p className="text-red-600 text-sm mt-2">
          {validationErrors.street}
        </p>
      )}
    </div>
  );

  // Render Payment Method Selection - COD Only
  const renderPaymentMethod = () => (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
      <div className="grid grid-cols-1 gap-4">
        {/* COD Only */}
        <div 
          className={`border border-gray-300 rounded-xl p-4 cursor-pointer transition-all ${
            paymentMethod === 'COD' 
              ? 'border-gray-900 bg-gray-50' 
              : 'hover:border-gray-400'
          }`}
          onClick={() => setPaymentMethod('COD')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'COD' ? 'border-gray-900 bg-gray-900' : 'border-gray-400'
            }`}>
              {paymentMethod === 'COD' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Cash on Delivery</p>
              <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render guest checkout header section
  const renderGuestCheckoutHeader = () => {
    if (!isGuestCheckout) return null;
    
    return (
      <div className="mb-6 bg-white rounded-3xl border border-gray-300 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Guest Checkout</h2>
            <p className="text-gray-600 text-sm">
              You're checking out as a guest. Your order will be stored for 30 days.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLoginForCheckout}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Login to Account
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setIsLoginModalOpen(true);
              }}
              className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
        
        {!showGuestForm && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-700 text-sm">
              <strong>Note:</strong> Guest orders can be tracked using your order ID and email.
              Create an account later to save your order history permanently.
            </p>
            <button
              onClick={() => setShowGuestForm(true)}
              className="mt-3 text-blue-600 font-medium text-sm hover:text-blue-800"
            >
              Continue as guest →
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render user checkout header section
  const renderUserCheckoutHeader = () => {
    if (isGuestCheckout) return null;
    
    return (
      <div className="mb-6 bg-white rounded-3xl border border-gray-300 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Welcome back, {user?.name || 'User'}!</h3>
            <p className="text-gray-600 text-sm">Your order will be saved to your account history.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your order with delivery information</p>
          </div>

          {/* Guest/User Checkout Header */}
          {renderGuestCheckoutHeader()}
          {renderUserCheckoutHeader()}

          {/* Only show form if user is logged in OR guest form is shown */}
          {(!isGuestCheckout || (isGuestCheckout && showGuestForm)) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Delivery Information */}
              <div className="bg-white rounded-3xl border border-gray-300 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {isGuestCheckout ? 'Guest Information' : 'Delivery Information'}
                </h2>
                
                <form onSubmit={onSubmitHandler} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInputField('fullName', 'text', 'Enter full name', 'Full Name')}
                    {renderInputField('email', 'email', 'your@email.com', 'Email Address')}
                  </div>
                  
                  {renderAddressInput()}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSelectField('state', pakistanStates, 'Select province', 'Province')}
                    {renderCityInput()}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderZipCodeInput()}
                    {renderInputField('phone', 'tel', '03XX-XXXXXXX', 'Phone Number')}
                  </div>

                  {renderPaymentMethod()}
                  
               
                </form>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:sticky lg:top-4 lg:h-fit space-y-6">
                <div className="bg-white rounded-3xl border border-gray-300 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  <CartTotal/>
                </div>
              
                {/* Place Order Button */}
                <div className="p-8">
                  <button 
                    type='submit' 
                    onClick={onSubmitHandler}
                    className={`w-full bg-black text-white px-6 py-4 font-semibold rounded-3xl hover:bg-gray-800 transition-colors ${
                      loading || !isDataReady || isValidatingAddress
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    disabled={loading || !isDataReady || isValidatingAddress}
                  >
                    {isValidatingAddress ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Validating Address...
                      </span>
                    ) : loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Placing Order...
                      </span>
                    ) : !isDataReady ? (
                      'Loading...'
                    ) : isGuestCheckout ? (
                      `Place Order`
                    ) : (
                      `Place Order`
                    )}
                  </button>
                  
                  {isGuestCheckout && (
                    <p className="text-center text-gray-600 text-sm mt-4">
                      By placing this order, you agree to our Terms of Service. 
                      Your order will be stored for 30 days.
                    </p>
                  )}
                </div>
                
                {/* Validation Summary */}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-3xl">
                    <p className="text-red-700 text-sm font-medium">
                      Please fix the following errors before placing your order:
                    </p>
                    <ul className="text-red-600 text-sm mt-2 space-y-1">
                      {Object.entries(validationErrors).map(([field, error]) => (
                        field !== 'zipcode' && (
                          <li key={field} className="flex items-center gap-2">
                            <span>•</span> {error}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : isGuestCheckout ? (
            // Show continue button for guest checkout
            <div className="bg-white rounded-3xl border border-gray-300 p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Checkout?</h3>
              <p className="text-gray-600 mb-6">
                Continue as guest to place your order. You'll be able to track it using your email and order ID.
              </p>
              <button
                onClick={handleGuestCheckout}
                className="bg-black text-white px-8 py-4 rounded-3xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Continue as Guest
              </button>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">Or create an account for:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📦</span>
                    </div>
                    <p className="text-sm font-medium">Order History</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🚚</span>
                    </div>
                    <p className="text-sm font-medium">Fast Checkout</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🔔</span>
                    </div>
                    <p className="text-sm font-medium">Order Updates</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setIsLoginModalOpen(true);
                  }}
                  className="mt-6 w-full border border-gray-300 px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authMode}
      />
    </>
  );
};

export default PlaceOrder;