import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from '../components/Title';
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('default');

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory(prev => prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]);
    setSubCategory([]); // reset subcategory when category changes
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]);
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Search filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    // Sub-category filter
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subcategory));
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let productsCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(productsCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(productsCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => setFilterProducts(products), [products]);
  useEffect(() => applyFilter(), [category, subCategory, search, showSearch]);
  useEffect(() => sortProduct(), [sortType]);

  // Compute categories dynamically
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Compute subcategories based on selected categories
  const uniqueSubCategories = Array.from(
    new Set(
      products
        .filter(p => category.length === 0 || category.includes(p.category))
        .map(p => p.subcategory)
        .filter(Boolean)
    )
  );

  return (
    <div className="flex flex-col gap-1 border-t pt-10 sm:flex-row sm:gap-10">
      <div className="min-w-60">
        <p onClick={() => setShowFilter(!showFilter)} className="my-2 flex cursor-pointer items-center gap-2 text-xl">
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>

        <div className={`mt-6 border border-gray-300 py-3 pl-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {uniqueCategories.map(cat => (
              <p key={cat} className="flex gap-2">
                <input className="w-3" type="checkbox" value={cat} onChange={toggleCategory} />
                {cat}
              </p>
            ))}
          </div>

          {uniqueSubCategories.length > 0 && (
            <>
              <p className="mt-4 mb-3 text-sm font-medium">SUBCATEGORIES</p>
              <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                {uniqueSubCategories.map(sub => (
                  <p key={sub} className="flex gap-2">
                    <input className="w-3" type="checkbox" value={sub} onChange={toggleSubCategory} />
                    {sub}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-4 flex justify-between text-base sm:text-2xl">
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select onChange={(e) => setSortType(e.target.value)} className="border-2 border-gray-300 px-2 text-sm">
            <option value="default">Sort by: Relevent</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
