import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from '../components/Title';
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom"; 

const Cart = () => {
  const { 
    products, 
    deals, 
    currency, 
    cartItems, 
    cartDeals,
    updateQuantity,
    updateDealQuantity,
    getCart
  } = useContext(ShopContext);
  
  const [productCartData, setProductCartData] = useState([]);
  const [dealCartData, setDealCartData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  // Update cart data whenever cartItems or cartDeals change
  useEffect(() => {
    console.log("🛒 Cart State Debug:");
    console.log("cartItems (products):", cartItems);
    console.log("cartDeals (deals):", cartDeals);
    console.log("Available products:", products.length);
    console.log("Available deals:", deals.length);

    // Process products
    const tempProductData = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const product = products.find(p => p._id === itemId);
        if (product) {
          tempProductData.push({
            id: itemId, 
            quantity: cartItems[itemId],
            type: 'product',
            data: product
          });
        } else {
          console.warn("❌ Product not found in products array:", itemId);
        }
      }
    }
    setProductCartData(tempProductData);

    // Process deals
    const tempDealData = [];
    for (const dealId in cartDeals) {
      if (cartDeals[dealId] > 0) {
        const deal = deals.find(d => d._id === dealId);
        if (deal) {
          tempDealData.push({
            id: dealId, 
            quantity: cartDeals[dealId],
            type: 'deal',
            data: deal
          });
        } else {
          console.warn("❌ Deal not found in deals array:", dealId);
        }
      }
    }
    setDealCartData(tempDealData);

    console.log("✅ Processed product cart data:", tempProductData);
    console.log("✅ Processed deal cart data:", tempDealData);
  }, [cartItems, cartDeals, products, deals]);

  const getItemDisplayData = (item) => {
    if (item.type === 'product') {
      const product = item.data;
      const unitPrice = product.discountprice > 0 ? product.discountprice : product.price;
      const itemTotalPrice = unitPrice * item.quantity;

      return {
        name: product.name,
        image: product.image?.[0] || assets.placeholder_image,
        unitPrice,
        itemTotalPrice,
        type: 'product',
        description: product.description,
        fullData: product,
        originalPrice: product.price,
        hasDiscount: product.discountprice > 0
      };
    } else {
      const deal = item.data;
      const unitPrice = deal.dealFinalPrice || deal.dealTotal;
      const itemTotalPrice = unitPrice * item.quantity;

      return {
        name: deal.dealName,
        image: deal.dealImages?.[0] || assets.placeholder_image,
        unitPrice,
        itemTotalPrice,
        type: 'deal',
        description: deal.dealDescription,
        fullData: deal,
        originalTotalPrice: deal.dealTotal,
        savings: deal.dealSavings
      };
    }
  };

  const handleQuantityUpdate = (itemId, quantity, itemType) => {
    console.log("🔄 Updating quantity:", { itemId, quantity, itemType });
    if (itemType === 'deal') {
      updateDealQuantity(itemId, quantity);
    } else {
      updateQuantity(itemId, quantity);
    }
  };

  const handleRemoveItem = (itemId, itemType) => {
    handleQuantityUpdate(itemId, 0, itemType);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedItem(null);
  };

  const handleNavigateToProduct = (item) => {
    if (item.type === 'product') {
      navigate(`/product/${item.id}`);
    } else {
      navigate(`/deal/${item.id}`);
    }
  };

  // Refresh cart data
  const refreshCart = () => {
    console.log("🔄 Refreshing cart from server");
    const token = localStorage.getItem('token');
    if (token) {
      getCart(token);
    }
  };

  // Render product details modal
  const renderProductDetails = (itemData) => {
    const product = itemData.fullData;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={itemData.image}
              alt={itemData.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-600">{itemData.description || "No description available."}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Price:</span>
                <div className="text-right">
                  {itemData.hasDiscount ? (
                    <>
                      <span className="line-through text-gray-500 mr-2">
                        {currency}{itemData.originalPrice}
                      </span>
                      <span className="font-semibold text-green-600">
                        {currency}{itemData.unitPrice}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">{currency}{itemData.unitPrice}</span>
                  )}
                </div>
              </div>
              {itemData.hasDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>You Save:</span>
                  <span className="font-semibold">
                    {currency}{(itemData.originalPrice - itemData.unitPrice).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Quantity in Cart:</span>
                <span className="font-semibold">{selectedItem.quantity}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total:</span>
                <span className="font-semibold">{currency}{itemData.itemTotalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render deal details modal with products included
  const renderDealDetails = (itemData) => {
    const deal = itemData.fullData;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={itemData.image}
              alt={itemData.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Deal Description</h3>
              <p className="text-gray-600">{itemData.description || "No description available."}</p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">Deal Pricing</h3>
              {deal.dealTotal && deal.dealTotal > deal.dealFinalPrice && (
                <div className="flex justify-between">
                  <span>Original Total:</span>
                  <span className="line-through text-gray-500">
                    {currency}{deal.dealTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Deal Price:</span>
                <span className="font-semibold text-green-600">
                  {currency}{itemData.unitPrice.toFixed(2)}
                </span>
              </div>
              {deal.dealTotal && deal.dealTotal > deal.dealFinalPrice && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>You Save:</span>
                  <span>{currency}{(deal.dealTotal - deal.dealFinalPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Quantity in Cart:</span>
                <span className="font-semibold">{selectedItem.quantity}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total:</span>
                <span>{currency}{itemData.itemTotalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Products List */}
        {deal.dealProducts && deal.dealProducts.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">
              Includes {deal.dealProducts.length} products:
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {deal.dealProducts.map((product, index) => {
                const hasDiscount = product.discountprice > 0;
                const sellingPrice = hasDiscount ? product.discountprice : product.price;
                const productSubtotal = product.price * product.quantity;
                const productTotal = sellingPrice * product.quantity;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
            
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {hasDiscount ? (
                            <>
                              <span className="line-through text-gray-500 text-xs">
                                {currency}{product.price}
                              </span>
                              <span className="font-semibold text-green-600 text-sm">
                                {currency}{sellingPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-sm">{currency}{sellingPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {hasDiscount ? (
                          <>
                            <span className="line-through text-gray-500 text-xs">
                              Sub: {currency}{productSubtotal.toFixed(2)}
                            </span>
                            <span className="font-semibold text-green-600 text-sm">
                              Total: {currency}{productTotal.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-sm">
                            Total: {currency}{productTotal.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alternative: If deal uses products array instead of dealProducts */}
        {(!deal.dealProducts || deal.dealProducts.length === 0) && deal.products && deal.products.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">
              Includes {deal.products.length} products:
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {deal.products.map((productId, index) => {
                const product = products.find(p => p._id === productId);
                if (!product) return null;
                
                const hasDiscount = product.discountprice > 0;
                const sellingPrice = hasDiscount ? product.discountprice : product.price;
                const quantity = 1; // Default quantity if not specified
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={product.image?.[0] || assets.placeholder_image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {hasDiscount ? (
                            <>
                              <span className="line-through text-gray-500 text-xs">
                                {currency}{product.price}
                              </span>
                              <span className="font-semibold text-green-600 text-sm">
                                {currency}{sellingPrice}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-sm">{currency}{sellingPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {quantity}</p>
                      <div className="mt-1">
                        <span className="font-semibold text-sm">
                          Total: {currency}{(sellingPrice * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render details modal
  const renderDetailsModal = () => {
    if (!selectedItem) return null;

    const itemData = getItemDisplayData(selectedItem);
    const isProduct = selectedItem.type === 'product';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">{itemData.name}</h2>
              <button 
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {isProduct ? renderProductDetails(itemData) : renderDealDetails(itemData)}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-2xl">
        <Title text1={'YOUR'} text2={'CART'} />
      </div>
         
      <div>
        {productCartData.length === 0 && dealCartData.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            {/* Products Section */}
            {productCartData.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Products ({productCartData.length})</h3>
                {productCartData.map((item, index) => {
                  const itemData = getItemDisplayData(item);

                  return (
                    <div
                      key={`product-${item.id}-${index}`}
                      className="grid grid-cols-[4fr_0.5fr_0.5fr] items-center gap-4 border-y py-4 text-gray-700 sm:grid-cols-[4fr_2fr_0.5fr]"
                    >
                      <div className="flex items-start gap-6">
                        <img
                          className="w-16 sm:w-20 cursor-pointer hover:opacity-80 transition-opacity"
                          src={itemData.image}
                          alt={itemData.name}
                          onClick={() => handleViewDetails(item)}
                        />
                        <div>
                          <p 
                            className="text-xs font-medium sm:text-lg cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleViewDetails(item)}
                          >
                            {itemData.name}
                          </p>
                          <div className="mt-2 flex items-center gap-5">
                            {itemData.hasDiscount ? (
                              <div className="flex items-center gap-2">
                                <span className="line-through text-gray-500 text-sm">
                                  {currency}{itemData.originalPrice}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {currency}{itemData.unitPrice}
                                </span>
                              </div>
                            ) : (
                              <p>{currency}{itemData.unitPrice} (per item)</p>
                            )}
                            <button 
                              onClick={() => handleViewDetails(item)}
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="my-8 flex items-center gap-4">
                        <p>Quantity</p>
                        <input
                          onChange={(e) => {
                            const newQuantity = Number(e.target.value);
                            if (newQuantity >= 1 && newQuantity <= 10) {
                              handleQuantityUpdate(item.id, newQuantity, 'product');
                            }
                          }}
                          type="number"
                          className="max-w-10 border px-2 py-1 sm:max-w-20 sm:px-2"
                          min={1}
                          max={10}
                          value={item.quantity}
                        />
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-medium">
                          {currency}{itemData.itemTotalPrice.toFixed(2)}
                        </p>
                        <img
                          onClick={() => handleRemoveItem(item.id, 'product')}
                          className="mr-4 w-4 cursor-pointer sm:w-5 hover:opacity-70 transition-opacity"
                          src={assets.bin_icon}
                          alt="Delete"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Deals Section */}
            {dealCartData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Deals ({dealCartData.length})</h3>
                {dealCartData.map((item, index) => {
                  const itemData = getItemDisplayData(item);
                  const deal = item.data;

                  return (
                    <div
                      key={`deal-${item.id}-${index}`}
                      className="grid grid-cols-[4fr_0.5fr_0.5fr] items-center gap-4 border-y py-4 text-gray-700 sm:grid-cols-[4fr_2fr_0.5fr]"
                    >
                      <div className="flex items-start gap-6">
                        <img
                          className="w-16 sm:w-20 cursor-pointer hover:opacity-80 transition-opacity"
                          src={itemData.image}
                          alt={itemData.name}
                          onClick={() => handleViewDetails(item)}
                        />
                        <div>
                          <p 
                            className="text-xs font-medium sm:text-lg cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleViewDetails(item)}
                          >
                            {itemData.name}
                            <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              Deal
                            </span>
                          </p>
                          {itemData.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {itemData.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-5">
                            {deal.dealTotal && deal.dealTotal > deal.dealFinalPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="line-through text-gray-500 text-sm">
                                  {currency}{deal.dealTotal.toFixed(2)}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  {currency}{itemData.unitPrice.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold">
                                {currency}{itemData.unitPrice.toFixed(2)} (per deal)
                              </span>
                            )}
                            <button 
                              onClick={() => handleViewDetails(item)}
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="my-8 flex items-center gap-4">
                        <p>Quantity</p>
                        <input
                          onChange={(e) => {
                            const newQuantity = Number(e.target.value);
                            if (newQuantity >= 1 && newQuantity <= 10) {
                              handleQuantityUpdate(item.id, newQuantity, 'deal');
                            }
                          }}
                          type="number"
                          className="max-w-10 border px-2 py-1 sm:max-w-20 sm:px-2"
                          min={1}
                          max={10}
                          value={item.quantity}
                        />
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-medium">
                          {currency}{itemData.itemTotalPrice.toFixed(2)}
                        </p>
                        <img
                          onClick={() => handleRemoveItem(item.id, 'deal')}
                          className="mr-4 w-4 cursor-pointer sm:w-5 hover:opacity-70 transition-opacity"
                          src={assets.bin_icon}
                          alt="Delete"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="my-20 flex justify-end">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => navigate('/place-order')}
              className="bg-black px-8 py-3 text-sm text-white hover:bg-gray-700 active:bg-gray-800"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {/* Product/Deal Details Modal */}
      {showDetailsModal && renderDetailsModal()}
    </div>
  );
};

export default Cart;