import { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import DealItem from "./DealItem";

const RelatedDeals = ({ category, currentDealId }) => {
  const { deals, currency } = useContext(ShopContext); // Added currency from context
  const [relatedDeals, setRelatedDeals] = useState([]);

  const filteredDeals = useMemo(() => {
    if (deals && deals.length > 0) {
      return deals
        .filter((deal) => 
          category === deal.category && 
          deal._id !== currentDealId && // Exclude current deal
          deal.status === 'published' // Only show published deals
        )
        .slice(0, 5);
    }
    return [];
  }, [deals, category, currentDealId]);

  useEffect(() => {
    setRelatedDeals(filteredDeals);
  }, [filteredDeals]);

  // Calculate grid columns based on number of deals - Always 1 column on mobile
  const getGridColumns = () => {
    const count = relatedDeals.length;
    // Always start with 1 column on mobile, then responsive for larger screens
    if (count === 1) return "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };

  const handleDealClick = (dealId) => {
    // Optional: Add navigation logic if needed
    // navigate(`/deal/${dealId}`);
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="my-24">
      <div className="py-2 text-center text-3xl">
        <Title text1={"RELATED"} text2={"DEALS"} />
      </div>

      {relatedDeals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No related deals available.
        </div>
      ) : (
        <div className={`grid ${getGridColumns()} gap-4 gap-y-6 px-4`}>
          {relatedDeals.map((deal) => (
            <DealItem
              key={deal._id}
              id={deal._id}
              image={deal.dealImages && deal.dealImages.length > 0 ? deal.dealImages[0] : "/images/fallback-image.jpg"}
              name={deal.dealName}
              price={deal.dealTotal || 0}
              discount={deal.dealFinalPrice || 0}
              rating={deal.rating || 0}
              dealType={deal.dealType}
              productsCount={deal.dealProducts ? deal.dealProducts.length : 0}
              endDate={deal.dealEndDate}
              onDealClick={handleDealClick}
              currency={currency} // Use currency from context instead of hardcoded "$"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedDeals;