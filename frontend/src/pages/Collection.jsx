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
  const [backendCategories, setBackendCategories] = useState([]); // From backend API
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      // ✅ Hardcoded fallback for local + optional env var for prod
      const backendURL =
        typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "http://localhost:4000"
          : process.env.NEXT_PUBLIC_BACKEND_URL || "";

      const response = await fetch(`${backendURL}/api/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but got:", text);
        throw new Error("Invalid JSON response from server");
      }

      const data = await response.json();
      setBackendCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
        name: sub,
        _id: sub // Use name as ID for fallback
      }))
    }));
  };

  const toggleCategory = (e) => {
    const value = e.target.value;
    setSelectedCategories(prev => 
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
    setSelectedSubCategories([]); // reset subcategories when categories change
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSelectedSubCategories(prev => 
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const applyFilter = () => {
    let productsCopy = [...products];

    // Search filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      productsCopy = productsCopy.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    // Sub-category filter
    if (selectedSubCategories.length > 0) {
      productsCopy = productsCopy.filter(item => 
        selectedSubCategories.includes(item.subcategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let productsCopy = [...filterProducts];
    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => a.discountprice - b.discountprice);
        break;
      case 'high-low':
        productsCopy.sort((a, b) => b.discountprice - a.discountprice);
        break;
      case 'bestseller':
        productsCopy.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      default:
        // Default sorting (by relevance or date)
        productsCopy.sort((a, b) => b.date - a.date);
        break;
    }
    setFilterProducts(productsCopy);
  };

  // Get product counts for categories and subcategories
  const getCategoryProductCount = (categoryName) => {
    return products.filter(product => product.category === categoryName).length;
  };

  const getSubcategoryProductCount = (subcategoryName) => {
    return products.filter(product => {
      // Only count if parent category is selected or no categories are selected
      const parentCategorySelected = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      return parentCategorySelected && product.subcategory === subcategoryName;
    }).length;
  };

  // Get available subcategories based on selected categories
  const getAvailableSubcategories = () => {
    if (selectedCategories.length === 0) {
      // If no categories selected, show all subcategories from all categories
      const allSubcategories = new Set();
      backendCategories.forEach(cat => {
        cat.subcategories.forEach(sub => {
          allSubcategories.add(sub.name);
        });
      });
      return Array.from(allSubcategories);
    } else {
      // Only show subcategories from selected categories
      const availableSubcategories = new Set();
      backendCategories.forEach(cat => {
        if (selectedCategories.includes(cat.name)) {
          cat.subcategories.forEach(sub => {
            availableSubcategories.add(sub.name);
          });
        }
      });
      return Array.from(availableSubcategories);
    }
  };

  useEffect(() => {
    setFilterProducts(products);
  }, [products]);

  useEffect(() => {
    applyFilter();
  }, [selectedCategories, selectedSubCategories, search, showSearch]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

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
            {backendCategories.map(cat => (
              <label key={cat.name} className="flex gap-2 items-center cursor-pointer">
                <input 
                  className="w-4 h-4 accent-black text-black" 
                  type="checkbox" 
                  value={cat.name} 
                  onChange={toggleCategory}
                  checked={selectedCategories.includes(cat.name)}
                />
                <span>
                  {cat.name} 
                </span>
              </label>
            ))}
          </div>

          {/* Subcategories Section */}
          {getAvailableSubcategories().length > 0 && (
            <>
              <p className="mt-6 mb-3 text-sm font-medium">SUBCATEGORIES</p>
              <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                {getAvailableSubcategories().map(sub => (
                  <label key={sub} className="flex gap-2 items-center cursor-pointer">
                    <input 
                      className="w-4 h-4 accent-black text-black" 
                      type="checkbox" 
                      value={sub} 
                      onChange={toggleSubCategory}
                      checked={selectedSubCategories.includes(sub)}
                    />
                    <span>
                      {sub}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedSubCategories([]);
              }}
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
          
          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filterProducts.length} of {products.length} products
          </div>
          
          {/* Sort Dropdown */}
          <select 
            onChange={(e) => setSortType(e.target.value)} 
            className="border-2 border-gray-300 px-3 py-2 text-sm rounded"
            value={sortType}
          >
            <option value="default">Sort by: Relevance</option>
            <option value="bestseller">Sort by: Bestseller</option>
            <option value="low-high">Sort by: Price: Low to High</option>
            <option value="high-low">Sort by: Price: High to Low</option>
          </select>
        </div>

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
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedSubCategories([]);
              }}
              className="mt-4 px-6 py-2 bg-black text-white  hover:bg-gray-900"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;