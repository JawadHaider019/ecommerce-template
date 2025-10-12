import React, { useState, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const Add = ({ token }) => {
  // --- Category & Subcategory State ---
  const [categories] = useState({
    Soap: ["Neem", "Aloe Vera", "Charcoal"],
    Shampoo: ["Anti-Dandruff", "Herbal", "Protein"],
    Facewash: ["Oil Control", "Whitening", "Sensitive Skin"],
  });
  const [category, setCategory] = useState("Soap");
  const [subCategory, setSubCategory] = useState(categories["Soap"][0]);

  // --- Product Info State ---
  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [discountprice, setDiscountprice] = useState("");
  const [cost, setCost] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Deal State ---
  const [isDeal, setIsDeal] = useState(false);
  const [dealProducts, setDealProducts] = useState([]);
  const [dealDiscountType, setDealDiscountType] = useState("percentage");
  const [dealDiscountValue, setDealDiscountValue] = useState(0);
  const [dealName, setDealName] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [dealImages, setDealImages] = useState([null, null, null, null]);
  const [dealStartDate, setDealStartDate] = useState("");
  const [dealEndDate, setDealEndDate] = useState("");

  // Memoized calculations
  const calculateDealTotal = useCallback(() => {
    return dealProducts.reduce((total, product) => {
      return total + (Number(product.total) || 0);
    }, 0);
  }, [dealProducts]);

  const calculateFinalPrice = useCallback(() => {
    const total = calculateDealTotal();
    if (dealDiscountType === "percentage") {
      return total - (total * (Number(dealDiscountValue) || 0)) / 100;
    } else {
      return total - (Number(dealDiscountValue) || 0);
    }
  }, [calculateDealTotal, dealDiscountType, dealDiscountValue]);

  const dealTotal = useMemo(() => calculateDealTotal(), [calculateDealTotal]);
  const finalPrice = useMemo(() => calculateFinalPrice(), [calculateFinalPrice]);

  // --- Handlers ---
  const handleImageChange = useCallback((e, index) => {
    const file = e.target.files[0];
    if (file) setImages((prev) => prev.map((img, i) => (i === index ? file : img)));
  }, []);

  const handleDealImageChange = useCallback((e, index) => {
    const file = e.target.files[0];
    if (file) setDealImages((prev) => prev.map((img, i) => (i === index ? file : img)));
  }, []);

  const handleAddDealProduct = useCallback(() => {
    setDealProducts((prev) => [
      ...prev,
      { 
        name: "", 
        cost: 0, 
        price: 0, 
        quantity: 1, 
        total: 0 
      },
    ]);
  }, []);

  const handleRemoveDealProduct = useCallback((index) => {
    setDealProducts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDealProductChange = useCallback((index, field, value) => {
    setDealProducts((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const updated = { ...p, [field]: value };
          if (["cost", "price", "quantity"].includes(field)) {
            updated.total = (Number(updated.price) || 0) * (Number(updated.quantity) || 0);
          }
          return updated;
        }
        return p;
      })
    );
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setImages([null, null, null, null]);
    setQuantity("");
    setCost("");
    setPrice("");
    setDiscountprice("");
    setBestseller(false);
    setDealProducts([]);
    setIsDeal(false);
    setDealDiscountValue(0);
    setDealName("");
    setDealDescription("");
    setDealImages([null, null, null, null]);
    setDealStartDate("");
    setDealEndDate("");
    const firstCategory = Object.keys(categories)[0];
    setCategory(firstCategory);
    setSubCategory(categories[firstCategory][0]);
  }, [categories]);

  const onSubmitHandler = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      if (!isDeal) {
        // === PRODUCT SUBMISSION ===
        // Product basic data
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("subcategory", subCategory);
        formData.append("quantity", Number(quantity));
        formData.append("bestseller", bestseller);
        formData.append("cost", Number(cost || 0));
        formData.append("price", Number(price));
        formData.append("discountprice", Number(discountprice || 0));

        // Append product images with correct field names
        images.forEach((img, index) => {
          if (img) {
            formData.append(`image${index + 1}`, img);
          }
        });

        console.log("=== PRODUCT FORM DATA ===");
        for (let [key, value] of formData.entries()) {
          console.log(key, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
        }

        const { data } = await axios.post(`${backendUrl}/api/product/add`, formData, {
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (data.success) {
          toast.success(data.message);
          resetForm();
        } else {
          toast.error(data.message);
        }
      } else {
        // === DEAL SUBMISSION ===
        // Deal basic data
        formData.append("dealName", dealName);
        formData.append("dealDescription", dealDescription);
        formData.append("dealDiscountType", dealDiscountType);
        formData.append("dealDiscountValue", Number(dealDiscountValue));
        formData.append("dealTotal", dealTotal);
        formData.append("dealFinalPrice", finalPrice);
        
        if (dealStartDate) formData.append("dealStartDate", dealStartDate);
        if (dealEndDate) formData.append("dealEndDate", dealEndDate);

        // Deal products data (without images)
        const dealProductsData = dealProducts.map(p => ({
          name: p.name,
          cost: Number(p.cost || 0),
          price: Number(p.price || 0),
          quantity: Number(p.quantity || 1),
          total: Number(p.total || 0)
        }));
        formData.append("dealProducts", JSON.stringify(dealProductsData));

        // Append deal images with correct field name
        dealImages.forEach((img) => {
          if (img) {
            formData.append("dealImage", img);
          }
        });

        console.log("=== DEAL FORM DATA ===");
        for (let [key, value] of formData.entries()) {
          console.log(key, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
        }

        const { data } = await axios.post(`${backendUrl}/api/deal/add`, formData, {
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (data.success) {
          toast.success(data.message);
          resetForm();
        } else {
          toast.error(data.message);
        }
      }
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [
    isDeal, name, description, category, subCategory, quantity, bestseller, cost, price, discountprice, images,
    dealName, dealDescription, dealDiscountType, dealDiscountValue, dealTotal, finalPrice, dealStartDate,
    dealEndDate, dealProducts, dealImages, token, resetForm, backendUrl
  ]);

  // Memoized sub-components
  const productImagesSection = useMemo(() => (
    <ProductImagesSection images={images} handleImageChange={handleImageChange} />
  ), [images, handleImageChange]);

  const dealImagesSection = useMemo(() => (
    <DealImagesSection dealImages={dealImages} handleDealImageChange={handleDealImageChange} />
  ), [dealImages, handleDealImageChange]);

  const productSection = useMemo(() => (
    <ProductSection
      categories={categories}
      category={category}
      setCategory={setCategory}
      subCategory={subCategory}
      setSubCategory={setSubCategory}
      name={name}
      setName={setName}
      description={description}
      setDescription={setDescription}
      cost={cost}
      setCost={setCost}
      price={price}
      setPrice={setPrice}
      discountprice={discountprice}
      setDiscountprice={setDiscountprice}
      quantity={quantity}
      setQuantity={setQuantity}
      bestseller={bestseller}
      setBestseller={setBestseller}
    />
  ), [categories, category, subCategory, name, description, cost, price, discountprice, quantity, bestseller]);

  const dealSection = useMemo(() => (
    <DealSection
      dealName={dealName}
      setDealName={setDealName}
      dealDescription={dealDescription}
      setDealDescription={setDealDescription}
      dealStartDate={dealStartDate}
      setDealStartDate={setDealStartDate}
      dealEndDate={dealEndDate}
      setDealEndDate={setDealEndDate}
      dealProducts={dealProducts}
      handleDealProductChange={handleDealProductChange}
      handleRemoveDealProduct={handleRemoveDealProduct}
      handleAddDealProduct={handleAddDealProduct}
      dealDiscountType={dealDiscountType}
      setDealDiscountType={setDealDiscountType}
      dealDiscountValue={dealDiscountValue}
      setDealDiscountValue={setDealDiscountValue}
      dealTotal={dealTotal}
      finalPrice={finalPrice}
    />
  ), [
    dealName, dealDescription, dealStartDate, dealEndDate, dealProducts, handleDealProductChange,
    handleRemoveDealProduct, handleAddDealProduct, dealDiscountType,
    dealDiscountValue, dealTotal, finalPrice
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{isDeal ? "Create New Deal" : "Add New Product"}</h2>
          <p className="text-gray-600 mt-2">
            {isDeal
              ? "Bundle products together with special discounts"
              : "Fill in the details to add a new product to your store"}
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Toggle Product/Deal */}
          <div className="mb-8 flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Create as:</span>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={isDeal} 
                  onChange={() => setIsDeal((prev) => !prev)} 
                  className="sr-only" 
                />
                <div className={`block w-14 h-7 rounded-full ${isDeal ? "bg-black" : "bg-gray-300"}`}></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${
                    isDeal ? "translate-x-7" : ""
                  }`}
                ></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">{isDeal ? "Deal" : "Product"}</span>
            </label>
          </div>

          {/* Images */}
          {!isDeal ? productImagesSection : dealImagesSection}

          {/* Form Sections */}
          {isDeal ? dealSection : productSection}

          {/* Submit */}
          <div className="flex items-center justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-3 font-medium rounded-lg flex items-center transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                </>
              ) : isDeal ? (
                <>
                  <i className="fas fa-tags mr-2"></i> Create Deal
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle mr-2"></i> Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Memoized sub-components
const ProductImagesSection = memo(({ images, handleImageChange }) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-4">Product Images</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <label key={index} htmlFor={`image${index}`} className="relative group cursor-pointer">
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-black transition-colors">
              {img ? (
                <img className="w-full h-full object-cover" src={URL.createObjectURL(img)} alt="Upload preview" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                  <span className="text-xs">Upload</span>
                </div>
              )}
            </div>
            <input type="file" id={`image${index}`} hidden onChange={(e) => handleImageChange(e, index)} accept="image/*" />
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">Click on each box to upload product images</p>
    </div>
  );
});

const DealImagesSection = memo(({ dealImages, handleDealImageChange }) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-4">Deal Images</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {dealImages.map((img, index) => (
          <label key={index} htmlFor={`dealImage${index}`} className="relative group cursor-pointer">
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-black transition-colors">
              {img ? (
                <img className="w-full h-full object-cover" src={URL.createObjectURL(img)} alt="Deal preview" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                  <span className="text-xs">Upload</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              id={`dealImage${index}`} 
              hidden 
              onChange={(e) => handleDealImageChange(e, index)} 
              accept="image/*" 
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">Click on each box to upload deal images</p>
    </div>
  );
});

const ProductSection = memo(({
  categories,
  category,
  setCategory,
  subCategory,
  setSubCategory,
  name,
  setName,
  description,
  setDescription,
  cost,
  setCost,
  price,
  setPrice,
  discountprice,
  setDiscountprice,
  quantity,
  setQuantity,
  bestseller,
  setBestseller
}) => {
  return (
    <>
      {/* Product Name & Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Enter product name"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product in detail..."
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors h-32 resize-none"
        />
      </div>

      {/* Category / Subcategory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory(categories[e.target.value][0]);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
          >
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
          >
            {categories[category]?.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prices / Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InputField label="Cost Price" value={cost} onChange={setCost} />
        <InputField label="Selling Price *" value={price} onChange={setPrice} required />
        <InputField label="Discount Price" value={discountprice} onChange={setDiscountprice} />
        <InputField label="Quantity *" value={quantity} onChange={setQuantity} required />
      </div>

      {/* Bestseller */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only" checked={bestseller} onChange={() => setBestseller((prev) => !prev)} />
          <div className={`w-10 h-6 rounded-full ${bestseller ? "bg-black" : "bg-gray-300"} relative`}>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${bestseller ? "translate-x-4" : ""}`}></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
            <i className="fas fa-star mr-2 text-yellow-500"></i> Mark as Bestseller
          </span>
        </label>
      </div>
    </>
  );
});

const DealSection = memo(({
  dealName,
  setDealName,
  dealDescription,
  setDealDescription,
  dealStartDate,
  setDealStartDate,
  dealEndDate,
  setDealEndDate,
  dealProducts,
  handleDealProductChange,
  handleRemoveDealProduct,
  handleAddDealProduct,
  dealDiscountType,
  setDealDiscountType,
  dealDiscountValue,
  setDealDiscountValue,
  dealTotal,
  finalPrice
}) => {
  return (
    <div className="space-y-6">
      {/* Deal Name / Description */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deal Name *</label>
          <input
            value={dealName}
            onChange={(e) => setDealName(e.target.value)}
            type="text"
            placeholder="e.g., Summer Skincare Bundle"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deal Description</label>
          <textarea
            value={dealDescription}
            onChange={(e) => setDealDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors h-24 resize-none"
            placeholder="Describe this deal and its benefits..."
          />
        </div>
      </div>

      {/* Deal Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input 
            type="date" 
            value={dealStartDate}
            onChange={(e) => setDealStartDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input 
            type="date" 
            value={dealEndDate}
            onChange={(e) => setDealEndDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors" 
          />
        </div>
      </div>

      {/* Deal Products */}
      <div className="bg-gray-50 p-5 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium flex items-center">
            <i className="fas fa-boxes mr-2 text-black"></i> Products in Deal
          </h4>
          <span className="text-sm text-gray-500">{dealProducts.length} product(s) added</span>
        </div>

        {dealProducts.map((p, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <InputSmall label="Name" value={p.name} onChange={(v) => handleDealProductChange(index, "name", v)} />
              <InputSmall label="Cost" value={p.cost} onChange={(v) => handleDealProductChange(index, "cost", Number(v))} />
              <InputSmall label="Price" value={p.price} onChange={(v) => handleDealProductChange(index, "price", Number(v))} />
              <InputSmall label="Qty" value={p.quantity} onChange={(v) => handleDealProductChange(index, "quantity", Number(v))} />
              <InputSmall label="Total" value={p.total} readOnly />
              <button 
                type="button" 
                onClick={() => handleRemoveDealProduct(index)} 
                className="text-red-600 hover:text-red-800 transition-colors p-2 text-sm"
              >
                <i className="fas fa-trash-alt mr-1"></i> Delete
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddDealProduct}
          className="flex items-center justify-center w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          <i className="fas fa-plus-circle mr-2"></i> Add Product to Deal
        </button>
      </div>

      {/* Discount */}
      <div className="bg-gray-50 p-5 rounded-lg mb-6">
        <h4 className="text-md font-medium mb-4 flex items-center">
          <i className="fas fa-percent mr-2 text-black"></i> Discount Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <div className="flex space-x-4">
              {["percentage", "flat"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={dealDiscountType === type}
                    onChange={(e) => setDealDiscountType(e.target.value)}
                    className="mr-2 text-black"
                  />
                  <span className="text-sm">{type === "percentage" ? "Percentage" : "Flat Amount"}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{dealDiscountType === "percentage" ? "%" : "$"}</span>
              </div>
              <input
                type="number"
                min="0"
                value={dealDiscountValue}
                onChange={(e) => setDealDiscountValue(e.target.value)}
                placeholder={dealDiscountType === "percentage" ? "e.g., 20" : "e.g., 5"}
                required
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Deal Summary */}
      <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-200">
        <h4 className="text-md font-medium mb-4 flex items-center">
          <i className="fas fa-receipt mr-2 text-blue-600"></i> Deal Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-gray-600">Total Value</div>
            <div className="text-lg font-bold text-gray-800">${dealTotal.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-gray-600">Discount</div>
            <div className="text-lg font-bold text-red-600">
              {dealDiscountType === "percentage" ? `${dealDiscountValue}%` : `$${dealDiscountValue}`}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-gray-600">Final Price</div>
            <div className="text-lg font-bold text-green-600">${finalPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

const InputField = memo(({ label, value, onChange, required = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        min="0"
        step="0.01"
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
      />
    </div>
  );
});

const InputSmall = memo(({ label, value, onChange, readOnly = false }) => {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-black transition-colors ${
          readOnly ? "bg-gray-100" : ""
        }`}
      />
    </div>
  );
});

export default Add;