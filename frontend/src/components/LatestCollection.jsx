import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from './Title';
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {

    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    <div className="my-10">
      <div className="py-8 text-center text-3xl">
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
        Experience the Beauty of Nature with Natura Bliss’s Newest Organic Skincare Collection
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {latestProducts.map((item) => (
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
  );
};

export default LatestCollection;