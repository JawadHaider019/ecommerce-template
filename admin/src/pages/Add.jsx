import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [categories, setCategories] = useState({
    Soap: ["Neem", "Aloe Vera", "Charcoal"],
    Shampoo: ["Anti-Dandruff", "Herbal", "Protein"],
    Facewash: ["Oil Control", "Whitening", "Sensitive Skin"],
  });

  const [category, setCategory] = useState("Soap");
  const [subCategory, setSubCategory] = useState(categories["Soap"][0]);

  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [discountprice, setDiscountprice] = useState("");
  const [cost, setCost] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------- Deals ----------
  const [isDeal, setIsDeal] = useState(false);
  const [dealProducts, setDealProducts] = useState([]);
  const [dealDiscountType, setDealDiscountType] = useState("percentage");
  const [dealDiscountValue, setDealDiscountValue] = useState(0);
  const [dealName, setDealName] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [dealImage, setDealImage] = useState(null); // New state for deal image

  const handleAddDealProduct = () => {
    setDealProducts([...dealProducts, { productId: "", quantity: 1 }]);
  };

  const handleRemoveDealProduct = (index) => {
    const updated = [...dealProducts];
    updated.splice(index, 1);
    setDealProducts(updated);
  };

  const handleDealProductChange = (index, field, value) => {
    const updated = [...dealProducts];
    updated[index][field] = value;
    setDealProducts(updated);
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  // Handle deal image upload
  const handleDealImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDealImage(file);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subcategory", subCategory);
      formData.append("quantity", Number(quantity));
      formData.append("bestseller", bestseller);
      formData.append("cost", Number(cost));
      formData.append("price", Number(price));
      formData.append("discountprice", Number(discountprice));

      if (isDeal) {
        formData.append("isDeal", true);
        formData.append("dealName", dealName);
        formData.append("dealDescription", dealDescription);
        formData.append("dealDiscountType", dealDiscountType);
        formData.append("dealDiscountValue", dealDiscountValue);
        formData.append("dealProducts", JSON.stringify(dealProducts));
        
        // Add deal image if exists
        if (dealImage) {
          formData.append("dealImage", dealImage);
        }
      }

      images.forEach((img, index) => {
        if (img) {
          formData.append(`image${index + 1}`, img);
        }
      });

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
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
        setDealImage(null);
        const firstCategory = Object.keys(categories)[0];
        setCategory(firstCategory);
        setSubCategory(categories[firstCategory][0]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isDeal ? "Create New Deal" : "Add New Product"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isDeal
              ? "Bundle products together with special discounts"
              : "Fill in the details to add a new product to your store"}
          </p>
        </div>

        <form
          onSubmit={onSubmitHandler}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          {/* Toggle: Product or Deal */}
          <div className="mb-8 flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Create as:
            </span>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isDeal}
                  onChange={() => setIsDeal((prev) => !prev)}
                  className="sr-only"
                />
                <div className={`block w-14 h-7 rounded-full ${isDeal ? 'bg-black' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${isDeal ? 'transform translate-x-7' : ''}`}></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {isDeal ? "Deal" : "Product"}
              </span>
            </label>
          </div>

          {/* Upload Images */}
          {!isDeal ? (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <label
                    key={index}
                    htmlFor={`image${index}`}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-black transition-colors">
                      {img ? (
                        <img
                          className="w-full h-full object-cover"
                          src={URL.createObjectURL(img)}
                          alt="Upload preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                          <span className="text-xs">Upload</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <i className="fas fa-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      </div>
                    </div>
                    <input
                      type="file"
                      id={`image${index}`}
                      hidden
                      onChange={(e) => handleImageChange(e, index)}
                      accept="image/*"
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click on each box to upload product images
              </p>
            </div>
          ) : (
            /* Deal Image Upload */
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Deal Image
              </label>
              <div className="flex justify-center">
                <label
                  htmlFor="dealImage"
                  className="relative group cursor-pointer w-full max-w-xs"
                >
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-black transition-colors">
                    {dealImage ? (
                      <img
                        className="w-full h-full object-cover"
                        src={URL.createObjectURL(dealImage)}
                        alt="Deal preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
                        <span className="text-sm">Upload Deal Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <i className="fas fa-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="dealImage"
                    hidden
                    onChange={handleDealImageChange}
                    accept="image/*"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click to upload an image for this deal
              </p>
            </div>
          )}

          {/* Deal Section */}
          {isDeal ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <i className="fas fa-tags text-black text-xl mr-3"></i>
                  <h3 className="text-lg font-semibold text-gray-800">Deal Information</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Create a special bundle offer with multiple products
                </p>
              </div>

              {/* Deal Name & Description */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-heading mr-2 text-gray-500"></i>
                    Deal Name *
                  </label>
                  <input
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    type="text"
                    placeholder="e.g., Summer Skincare Bundle"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-align-left mr-2 text-gray-500"></i>
                    Deal Description
                  </label>
                  <textarea
                    value={dealDescription}
                    onChange={(e) => setDealDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors h-24 resize-none"
                    placeholder="Describe this deal and its benefits..."
                  />
                </div>
              </div>

              {/* Deal Discount */}
              <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <h4 className="text-md font-medium mb-4 flex items-center">
                  <i className="fas fa-percent mr-2 text-black"></i>
                  Discount Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="percentage"
                          checked={dealDiscountType === "percentage"}
                          onChange={(e) => setDealDiscountType(e.target.value)}
                          className="mr-2 text-black"
                        />
                        <span className="text-sm">Percentage</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="flat"
                          checked={dealDiscountType === "flat"}
                          onChange={(e) => setDealDiscountType(e.target.value)}
                          className="mr-2 text-black"
                        />
                        <span className="text-sm">Flat Amount</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <div className="relative">
                      {dealDiscountType === "percentage" ? (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">%</span>
                        </div>
                      ) : (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      )}
                      <input
                        type="number"
                        value={dealDiscountValue}
                        onChange={(e) => setDealDiscountValue(e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors ${dealDiscountType === "percentage" ? "" : "pl-7"}`}
                        placeholder={dealDiscountType === "percentage" ? "e.g., 20" : "e.g., 5"}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Products */}
              <div className="bg-gray-50 p-5 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium flex items-center">
                    <i className="fas fa-boxes mr-2 text-black"></i>
                    Products in Deal
                  </h4>
                  <span className="text-sm text-gray-500">
                    {dealProducts.length} product(s) added
                  </span>
                </div>
                
                {dealProducts.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {dealProducts.map((p, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Product ID</label>
                          <input
                            type="text"
                            placeholder="Enter product ID"
                            value={p.productId}
                            onChange={(e) =>
                              handleDealProductChange(index, "productId", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={p.quantity}
                            onChange={(e) =>
                              handleDealProductChange(index, "quantity", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDealProduct(index)}
                          className="mt-5 p-2 text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleAddDealProduct}
                  className="flex items-center justify-center w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Add Product to Deal
                </button>
                
                {dealProducts.length === 0 && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Add at least two products to create a deal
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Normal Product Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-tag mr-2 text-gray-500"></i>
                  Product Name *
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  type="text"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-align-left mr-2 text-gray-500"></i>
                  Product Description *
                </label>
                <textarea
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors h-32 resize-none"
                  placeholder="Describe your product in detail..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-layer-group mr-2 text-gray-500"></i>
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubCategory(categories[e.target.value][0]);
                      }}
                    >
                      {Object.keys(categories).map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    </div>
                  </div>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-list-alt mr-2 text-gray-500"></i>
                    Subcategory *
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      required
                    >
                      {categories[category]?.map((sub, idx) => (
                        <option key={idx} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-dollar-sign mr-2 text-gray-500"></i>
                    Cost Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      onChange={(e) => setCost(e.target.value)}
                      value={cost}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-dollar-sign mr-2 text-gray-500"></i>
                    Selling Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      onChange={(e) => setPrice(e.target.value)}
                      value={price}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-tag mr-2 text-gray-500"></i>
                    Discount Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      onChange={(e) => setDiscountprice(e.target.value)}
                      value={discountprice}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-cubes mr-2 text-gray-500"></i>
                    Quantity *
                  </label>
                  <input
                    onChange={(e) => setQuantity(e.target.value)}
                    value={quantity}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    type="number"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Bestseller */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      className="sr-only"
                      onChange={() => setBestseller((prev) => !prev)}
                      checked={bestseller}
                      type="checkbox"
                      id="bestseller"
                    />
                    <div className={`block w-10 h-6 rounded-full ${bestseller ? 'bg-black' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${bestseller ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                    <i className="fas fa-star mr-2 text-yellow-500"></i>
                    Mark as Bestseller
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex items-center justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-3 font-medium transition-colors flex items-center ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : isDeal ? (
                <>
                  <i className="fas fa-tags mr-2"></i>
                  Create Deal
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle mr-2"></i>
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;