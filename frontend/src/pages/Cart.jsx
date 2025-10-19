import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from '../components/Title';
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom"; 

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  // Update cart data whenever cartItems change
  useEffect(() => {
    const tempData = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        tempData.push({
          id: itemId, 
          quantity: cartItems[itemId],
        });
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-2xl">
        <Title text1={'YOUR'} text2={'CART'} />
      </div>
      <div>
        {cartData.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          cartData.map((item, index) => {
          
            const productData = products.find((product) => product._id === item.id);

            if (!productData) {
              console.warn("Product not found for cart item:", item.id);
              return null;
            }

         const unitPrice =
  typeof productData.discountprice === "number" && productData.discountprice > 0
    ? productData.discountprice
    : productData.price;

const itemTotalPrice = unitPrice * item.quantity;


            return (
              <div
                key={index}
                className="grid grid-cols-[4fr_0.5fr_0.5fr] items-center gap-4 border-y py-4 text-gray-700 sm:grid-cols-[4fr_2fr_0.5fr]"
              >
                <div className="flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20"
                    src={productData.image[0]}
                    alt={productData.name}
                  />
                  <div>
                    <p className="text-xs font-medium sm:text-lg">{productData.name}</p>
                    <div className="mt-2 flex items-center gap-5">
                      <p>{currency}{productData.discountprice} (per unit)</p>
                    </div>
                  </div>
                </div>

                <div className="my-8 flex items-center gap-4">
                  <p>Quantity</p>
                  <input
                    onChange={(e) => {
                      const newQuantity = Number(e.target.value);
                      if (newQuantity >= 1 && newQuantity <= 10) {
                        updateQuantity(item.id, newQuantity); 
                      }
                    }}
                    type="number"
                    className="max-w-10 border px-2 py-1 sm:max-w-20 sm:px-2"
                    min={1}
                    value={item.quantity}
                  />
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-medium">
                    {currency}{itemTotalPrice.toFixed(2)}
                  </p>
                  <img
                    onClick={() => updateQuantity(item.id, 0)} 
                    className="mr-4 w-4 cursor-pointer sm:w-5"
                    src={assets.bin_icon}
                    alt="Delete"
                  />
                </div>
              </div>
            );
          })
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
    </div>
  );
};

export default Cart;
