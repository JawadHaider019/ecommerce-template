import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const ProductItem = ({ id, image, name, price, discount, rating }) => {
  const { currency } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render rating stars
  const renderRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Determine the actual price to display
  const actualPrice = discount ? discount : price; 

  return (
    <div onClick={handleClick} className="cursor-pointer text-gray-700">
      <div className="relative overflow-hidden">
        {discount && (
          <div className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-medium text-white">
            {Math.round(((price - discount) / price) * 100)}% OFF
          </div>
        )}
        <img
          className="transition ease-in-out hover:scale-110"
          src={image}
          alt={name}
        />
      </div>
      <p className="pb-1 pt-3 text-sm">{name}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">
          {currency} {actualPrice.toFixed(2)}
        </p>
        {discount && (
          <p className="text-sm text-gray-500 line-through">
            {currency} {price.toFixed(2)}
          </p>
        )}
      </div>
      {rating && <div className="mt-1 flex">{renderRating(rating)}</div>}
    </div>
  );
};

export default ProductItem;
