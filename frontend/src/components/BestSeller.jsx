import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      // Check if products exist and is an array
      if (!products || !Array.isArray(products)) {
        console.warn("Products is not available or not an array:", products);
        setBestSeller([]);
        setLoading(false);
        return;
      }

      console.log("Total products:", products.length);
      console.log("Sample product:", products[0]);

      // Try different possible property names for bestseller
      const bestProduct = products.filter((item) => {
        // Check multiple possible property names
        const isBestSeller = 
          item.bestseller || 
          item.bestSeller ||
          item.best_seller ||
          item.isBestseller ||
          item.isBestSeller ||
          item.featured || // sometimes featured products are considered best sellers
          item.bestseller === true ||
          item.bestseller === "true" ||
          item.bestseller === 1;

        console.log(`Product: ${item.name}, BestSeller:`, {
          bestseller: item.bestseller,
          bestSeller: item.bestSeller,
          best_seller: item.best_seller,
          isBestseller: item.isBestseller,
          isBestSeller: item.isBestSeller,
          calculated: isBestSeller
        });

        return isBestSeller;
      });

      console.log("Filtered best sellers:", bestProduct);

      // If no best sellers found, use fallback (highest rated products)
      if (bestProduct.length === 0) {
        console.log("No best sellers found, using fallback (highest rated products)");
        const fallbackBestSellers = [...products]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);
        setBestSeller(fallbackBestSellers);
      } else {
        setBestSeller(bestProduct.slice(0, 5));
      }

    } catch (err) {
      console.error("Error in BestSeller component:", err);
      setError("Failed to load best sellers");
      setBestSeller([]);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Fallback image import (make sure this exists in your project)
  const fallbackImage = "/images/fallback-image.jpg";

  if (loading) {
    return (
      <div className="my-10">
        <div className="py-8 text-center text-3xl">
          <Title text1={"BEST"} text2={"SELLERS"} />
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">Loading best sellers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-10">
        <div className="py-8 text-center text-3xl">
          <Title text1={"BEST"} text2={"SELLERS"} />
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="py-8 text-center text-3xl">
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
          Discover our most popular and loved products
        </p>
      </div>

      {bestSeller.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No best sellers available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {bestSeller.map((item) => (
            <ProductItem
              key={item._id || item.id}
              id={item._id || item.id}
              image={
                item.image && item.image.length > 0 
                  ? item.image[0] 
                  : fallbackImage
              }
              name={item.name || "Unnamed Product"}
              price={item.price || 0}
              discount={item.discountprice || item.discountPrice || 0}
              rating={item.rating || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;