import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from '../components/Title';
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [sortType, setSortType] = useState('default');
  const [backendCategories, setBackendCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchCategories = async () => {
      try {
    
        const response = await fetch(`${backendURL}/api/categories`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error("Invalid JSON response from server");
        }

        const data = await response.json();
        setBackendCategories(data);
        
      } catch (error) {
      
        const fallbackCategories = extractCategoriesFromProducts(products);
        setBackendCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [products]);

  // Helper function to extract categories from products as fallback
  const extractCategoriesFromProducts = (products) => {
    const categoryMap = {};
    
    products.forEach(product => {
      if (product.category && product.subcategory) {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = {
            name: product.category,
            subcategories: new Set()
          };
        }
        categoryMap[product.category].subcategories.add(product.subcategory);
      }
    });

    return Object.values(categoryMap).map(cat => ({
      name: cat.name,
      subcategories: Array.from(cat.subcategories).map(sub => ({
        name: sub
      }))
    }));
  };

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) ? prev.filter(c => c !== categoryName) : [...prev, categoryName]
    );
    setSelectedSubCategories([]);
  };

  const toggleSubCategory = (subcategoryName) => {
    setSelectedSubCategories(prev => 
      prev.includes(subcategoryName) ? prev.filter(s => s !== subcategoryName) : [...prev, subcategoryName]
    );
  };

  // Reset all filters function
  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSortType('default');
  };

  const applyFilter = () => {
    let productsCopy = [...products];

    // Search filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter - only compare by names
    if (selectedCategories.length > 0) {
      productsCopy = productsCopy.filter(item => {
        return selectedCategories.includes(item.category);
      });
    }

    // Sub-category filter - only compare by names
    if (selectedSubCategories.length > 0) {
      productsCopy = productsCopy.filter(item => {
        return selectedSubCategories.includes(item.subcategory);
      });
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let productsCopy = [...filterProducts];
    
    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => (a.discountprice || a.price) - (b.discountprice || b.price));
        break;
      case 'high-low':
        productsCopy.sort((a, b) => (b.discountprice || b.price) - (a.discountprice || a.price));
        break;
      case 'bestseller':
        productsCopy.sort((a, b) => {
          const aBest = a.bestseller ? 1 : 0;
          const bBest = b.bestseller ? 1 : 0;
          return bBest - aBest;
        });
        break;
      case 'rating':
        productsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Default sorting - newest first
        productsCopy.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        break;
    }
    setFilterProducts(productsCopy);
  };

  // Get product counts for categories
  const getCategoryProductCount = (categoryName) => {
    return products.filter(product => product.category === categoryName).length;
  };

  const getSubcategoryProductCount = (subcategoryName) => {
    return products.filter(product => {
      const parentCategorySelected = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      return parentCategorySelected && product.subcategory === subcategoryName;
    }).length;
  };

  // Get available subcategories based on selected categories
  const getAvailableSubcategories = () => {
    if (selectedCategories.length === 0) {
      const allSubcategories = new Set();
      backendCategories.forEach(cat => {
        if (cat.subcategories) {
          cat.subcategories.forEach(sub => {
            allSubcategories.add(sub.name);
          });
        }
      });
      return Array.from(allSubcategories);
    } else {
      const availableSubcategories = new Set();
      backendCategories.forEach(cat => {
        if (selectedCategories.includes(cat.name) && cat.subcategories) {
          cat.subcategories.forEach(sub => {
            availableSubcategories.add(sub.name);
          });
        }
      });
      return Array.from(availableSubcategories);
    }
  };

  // Initialize with all products
  useEffect(() => {
    if (products.length > 0) {
      setFilterProducts(products);
    }
  }, [products]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilter();
  }, [selectedCategories, selectedSubCategories, search, showSearch, products]);

  // Apply sorting when sort type changes
  useEffect(() => {
    if (filterProducts.length > 0) {
      sortProduct();
    }
  }, [sortType]);

  // Check if any filters are active
  const hasActiveFilters = selectedCategories.length > 0 || selectedSubCategories.length > 0 || sortType !== 'default';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 border-t pt-10 sm:flex-row sm:gap-10">
      {/* Filters Sidebar */}
      <div className="min-w-60">
        <p 
          onClick={() => setShowFilter(!showFilter)} 
          className="my-2 flex cursor-pointer items-center gap-2 text-xl"
        >
          FILTERS
          <img 
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} 
            src={assets.dropdown_icon} 
            alt="" 
          />
        </p>

        <div className={`mt-6 border border-gray-300 py-3 pl-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          {/* Categories Section */}
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {backendCategories.map(cat => {
              const productCount = getCategoryProductCount(cat.name);
              return (
                <label key={cat.name} className="flex gap-2 items-center cursor-pointer">
                  <input 
                    className="w-4 h-4 accent-black text-black" 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                  />
                  <span className="flex justify-between w-full">
                    <span>{cat.name}</span>
                    <span className="text-gray-400 text-xs pr-2">({productCount})</span>
                  </span>
                </label>
              );
            })}
          </div>

          {/* Subcategories Section */}
          {getAvailableSubcategories().length > 0 && (
            <>
              <p className="mt-6 mb-3 text-sm font-medium">SUBCATEGORIES</p>
              <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                {getAvailableSubcategories().map(sub => {
                  const productCount = getSubcategoryProductCount(sub);
                  return (
                    <label key={sub} className="flex gap-2 items-center cursor-pointer">
                      <input 
                        className="w-4 h-4 accent-black text-black" 
                        type="checkbox" 
                        checked={selectedSubCategories.includes(sub)}
                        onChange={() => toggleSubCategory(sub)}
                        disabled={productCount === 0}
                      />
                      <span className="flex justify-between w-full">
                        <span className={productCount === 0 ? 'text-gray-400' : ''}>
                          {sub}
                        </span>
                        <span className="text-gray-400 text-xs pr-2">({productCount})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="mt-4 text-sm text-black hover:text-gray-500 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          
          {/* Results count and active filters */}
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              Showing {filterProducts.length} of {products.length} products
            </div>
            {hasActiveFilters && (
              <div className="text-xs text-gray-500">
                {selectedCategories.length > 0 && `Categories: ${selectedCategories.join(', ')} `}
                {selectedSubCategories.length > 0 && `Subcategories: ${selectedSubCategories.join(', ')} `}
                {sortType !== 'default' && `Sorted by: ${sortType}`}
              </div>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <select 
            onChange={(e) => setSortType(e.target.value)} 
            className="border-2 border-gray-300 px-3 py-2 text-sm rounded"
            value={sortType}
          >
            <option value="default">Sort by: Relevance</option>
            <option value="bestseller">Sort by: Bestseller</option>
            <option value="rating">Sort by: Highest Rated</option>
            <option value="low-high">Sort by: Price: Low to High</option>
            <option value="high-low">Sort by: Price: High to Low</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedCategories.map(cat => (
              <span 
                key={cat} 
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {cat}
                <button 
                  onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedSubCategories.map(sub => (
              <span 
                key={sub} 
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {sub}
                <button 
                  onClick={() => setSelectedSubCategories(prev => prev.filter(s => s !== sub))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filterProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
            {filterProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image && item.image.length > 0 ? item.image[0] : assets.fallback_image}
                name={item.name}
                price={item.price}
                discount={item.discountprice}
                rating={item.rating || 0}
                bestseller={item.bestseller}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="mt-4 px-6 py-2 bg-black text-white hover:bg-gray-900 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;