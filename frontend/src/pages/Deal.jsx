import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProduct from '../components/RelatedProduct';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';

const Deal = () => {
  const { dealId } = useParams();
  const { backendUrl, currency, addToCart } = useContext(ShopContext);
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filterRating, setFilterRating] = useState(null);

  // Fetch deal data
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching deal with ID:', dealId);
        console.log('🔗 Backend URL:', backendUrl);

        const response = await fetch(`${backendUrl}/api/deal/single`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dealId }),
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Deal API response:', data);

        if (data.success && data.deal) {
          setDealData(data.deal);
          if (data.deal.dealImages && data.deal.dealImages.length > 0) {
            setImage(data.deal.dealImages[0]);
          }
          console.log('🎯 Deal data set:', data.deal);
        } else {
          throw new Error(data.message || 'Deal not found');
        }
      } catch (error) {
        console.error('❌ Error fetching deal:', error);
        setError(error.message || 'Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchDeal();
    } else {
      setError('No deal ID provided');
      setLoading(false);
    }
  }, [dealId, backendUrl]);

  // Calculate total stock for the deal
  const calculateTotalStock = () => {
    if (!dealData?.dealProducts) return 0;
    return dealData.dealProducts.reduce((total, product) => total + (product.quantity || 0), 0);
  };

  const stock = calculateTotalStock();

  // Render stock status
  const renderStockStatus = () => {
    if (stock === 0) {
      return <p className="p-4 text-red-500">Out of Stock</p>;
    } else if (stock < 10) {
      return <p className="p-4 text-red-500">{stock} items left</p>;
    } else if (stock < 20) {
      return <p className="p-4 text-orange-500">Limited items left</p>;
    } else {
      return <p className="p-4 text-green-500">In Stock</p>;
    }
  };

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    value = Math.min(value, stock);
    setQuantity(value);
  };

  // Handle multiple image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const imageUrls = files.map((file) => URL.createObjectURL(file));
      setReviewImages((prevImages) => [...prevImages, ...imageUrls]);
    }
  };

  // Handle review submission
  const handleSubmitReview = () => {
    if (rating === 0 || comment.trim() === '') {
      alert('Please provide a rating and comment.');
      return;
    }

    const newReview = {
      id: Date.now(),
      rating,
      comment,
      images: reviewImages,
      date: new Date().toLocaleDateString(),
    };

    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setRating(0);
    setComment('');
    setReviewImages([]);
  };

  // Handle image click to show in modal
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Toggle to show all reviews or only 10 reviews
  const toggleShowAllReviews = () => {
    setShowAllReviews((prev) => !prev);
  };

  // Filter reviews by rating
  const filterReviewsByRating = (rating) => {
    if (filterRating === rating) {
      setFilterRating(null);
    } else {
      setFilterRating(rating);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // Get rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  // Get the reviews to display (filtered by rating or all)
  const filteredReviews = filterRating
    ? reviews.filter((review) => review.rating === filterRating)
    : reviews;

  // Get the reviews to display (10 initially or all)
  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 10);

  // Render rating stars
  const renderRating = (ratingValue = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStar />
          </span>
        );
      } else if (i - 0.5 <= ratingValue) {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaStarHalf />
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-yellow-400">
            <FaRegStar />
          </span>
        );
      }
    }
    return stars;
  };

  const handleAddToCart = () => {
    if (stock === 0) return;
    
    // Add all products in the deal to cart
    if (dealData.dealProducts && Array.isArray(dealData.dealProducts)) {
      let addedCount = 0;
      dealData.dealProducts.forEach(product => {
        if (product._id || product.id) {
          addToCart(product._id || product.id, quantity);
          addedCount++;
        }
      });
      
      if (addedCount > 0) {
        alert(`Added ${dealData.dealName} to cart! (${addedCount} items)`);
      } else {
        alert("No valid products in this deal");
      }
    }
    setQuantity(1);
  };

  const renderClickableStars = (currentRating, setRatingFunc) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="cursor-pointer text-yellow-400"
          onClick={() => setRatingFunc(i)}
        >
          {i <= currentRating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  };

  const getDealTypeBadge = (type) => {
    const typeMap = {
      'flash_sale': { label: 'Flash Sale', color: 'bg-red-500 text-white' },
      'seasonal': { label: 'Seasonal', color: 'bg-green-500 text-white' },
      'clearance': { label: 'Clearance', color: 'bg-orange-500 text-white' },
      'bundle': { label: 'Bundle', color: 'bg-purple-500 text-white' },
      'featured': { label: 'Featured', color: 'bg-blue-500 text-white' },
      'buyonegetone': { label: 'BOGO', color: 'bg-pink-500 text-white' }
    };
    
    return typeMap[type] || { label: type, color: 'bg-gray-500 text-white' };
  };

  if (loading) {
    return (
      <div className="border-t-2 pt-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading deal...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t-2 pt-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!dealData) {
    return (
      <div className="border-t-2 pt-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Deal not found</div>
        </div>
      </div>
    );
  }

  const dealType = getDealTypeBadge(dealData.dealType);

  return (
    <div className="border-t-2 pt-10">
      <div className="flex flex-col gap-12 sm:flex-row sm:gap-12">
        <div className="flex flex-1 flex-col-reverse gap-3 sm:flex-row">
          {/* Thumbnail Images */}
          <div className="flex w-full justify-between overflow-x-auto sm:w-[18%] sm:flex-col sm:justify-normal sm:overflow-y-auto">
            {dealData.dealImages && dealData.dealImages.map((item, index) => (
              <img
                key={index}
                src={item}
                alt={`Deal Thumbnail ${index + 1}`}
                className="w-[24%] shrink-0 cursor-pointer sm:mb-3 sm:w-full"
                onClick={() => setImage(item)} 
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full sm:w-4/5">
            {/* Deal Type Badge */}
            <div className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${dealType.color}`}>
              {dealType.label}
            </div>
            
            {/* Discount Badge */}
            <div className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
              {dealData.dealDiscountType === 'percentage' 
                ? `${dealData.dealDiscountValue}% OFF` 
                : `Rs. ${dealData.dealDiscountValue} OFF`}
            </div>
            
            <img
              src={image || '/images/fallback-image.jpg'}
              alt="Main Deal"
              className="h-auto w-full"
              onError={(e) => {
                e.target.src = '/images/fallback-image.jpg';
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="mt-2 text-2xl font-medium">{dealData.dealName}</h1>
          <div className="mt-2 flex items-center gap-1">
            {renderRating(dealData.rating || 0)} 
            <p className="pl-2">{(dealData.rating || 0).toFixed(1)}</p>
          </div>
          
          {/* Deal Products List */}
          {dealData.dealProducts && dealData.dealProducts.length > 0 && (
            <div className="mt-4">
              <p className="font-medium">Includes {dealData.dealProducts.length} products:</p>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {dealData.dealProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-1 text-sm">
                    <span className="flex-1 truncate">{product.name}</span>
                    <span className="ml-2 text-gray-600">Rs. {product.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-4">
            <p className="text-3xl font-medium">
              {currency} {dealData.dealFinalPrice?.toFixed(2) || '0.00'}
            </p>
            
            {dealData.dealTotal && dealData.dealTotal > dealData.dealFinalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {currency} {dealData.dealTotal.toFixed(2)}
              </p>
            )}
          </div>

          {dealData.dealTotal && dealData.dealTotal > dealData.dealFinalPrice && (
            <p className="mt-2 text-green-600 font-medium">
              You save: {currency} {(dealData.dealTotal - dealData.dealFinalPrice).toFixed(2)}
            </p>
          )}

          <p className="mt-5 text-gray-500 md:w-4/5">{dealData.dealDescription}</p>
          
          {/* Deal Period */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Deal Period:</strong>{' '}
              {dealData.dealStartDate ? new Date(dealData.dealStartDate).toLocaleDateString() : 'Immediately'} 
              {dealData.dealEndDate && ` - ${new Date(dealData.dealEndDate).toLocaleDateString()}`}
            </p>
          </div>

          <div className="my-8 flex items-center gap-4">
            <p>Quantity</p>
            <div className="flex items-center gap-2">
              <input
                className="w-16 rounded border-2 border-gray-300 px-2 py-1 text-center text-sm"
                type="number"
                value={quantity}
                min={1}
                max={stock} 
                onChange={handleQuantityChange}
              />
            </div>
          </div>
          {renderStockStatus()}
          <button
            onClick={handleAddToCart}
            className={`btn ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={stock === 0}
          >
            {stock === 0 ? 'OUT OF STOCK' : 'ADD DEAL TO CART'}
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="mt-5 flex flex-col gap-1 text-sm text-gray-500">
            <p>100% Original products.</p>
            <p>Cash on delivery is available on this deal.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-medium">Customer Reviews</h2>
        <div className="mt-4 flex flex-col items-center gap-6 rounded-lg border p-6 sm:flex-row">
          {/* Left Side – Average Rating */}
          <div className="flex flex-1 flex-col items-center">
            <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">out of 5</span>
            </div>
            <div className="mt-2 flex gap-1">{renderRating(averageRating)}</div>
            <p className="mt-2 text-sm text-gray-500">Based on {reviews.length} reviews</p>
          </div>

          {/* Right Side – Star Rating Distribution & Filters */}
          <div className="flex-1">
            <div className="mt-2 space-y-2">
              {ratingBreakdown.map(({ star, count }) => (
                <div
                  key={star}
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => filterReviewsByRating(star)}
                >
                  <div className="flex gap-1">{renderRating(star)}</div>
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-yellow-400"
                      style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Description and Reviews */}
      <div className="mt-20">
        <div className="flex">
          <button
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Description Tab Content */}
        {activeTab === 'description' && (
          <div className="flex flex-col gap-4 border p-6 text-sm text-gray-500">
            <p>{dealData.dealDescription}</p>
            {dealData.dealProducts && dealData.dealProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Products Included:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {dealData.dealProducts.map((product, index) => (
                    <li key={index}>
                      <strong>{product.name}</strong> - Rs. {product.price} 
                      {product.quantity > 1 && ` (Quantity: ${product.quantity})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="border p-6">
            {/* Review Form */}
            <div className="mb-8">
              <h3 className="text-lg font-medium">Leave a Review</h3>
              <div className="mt-4">
                <p className="mb-2">Your Rating:</p>
                <div className="flex gap-1">
                  {renderClickableStars(rating, setRating)}
                </div>
              </div>
              <textarea
                className="mt-4 w-full rounded border-2 border-gray-300 p-2 text-sm"
                rows="4"
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="text-sm"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {reviewImages.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Review Image ${index + 1}`}
                    className="size-20 rounded object-cover"
                  />
                ))}
              </div>
              <button
                className="btn mt-4"
                onClick={handleSubmitReview}
              >
                Submit Review
              </button>
            </div>

            {/* Display Existing Reviews */}
            <div className="mt-8">
              <h3 className="text-lg font-medium">Customer Reviews</h3>
              {reviews.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <>
                  {displayedReviews.map((review) => (
                    <div key={review.id} className="mt-4 border-b pb-4">
                      <div className="flex items-center gap-1">
                        {renderRating(review.rating)}
                        <p className="text-sm text-gray-500">({review.date})</p>
                      </div>
                      <p className="mt-2 text-sm">{review.comment}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {review.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Review Image ${index + 1}`}
                            className="size-20 cursor-pointer rounded object-cover"
                            onClick={() => handleImageClick(imageUrl)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredReviews.length > 10 && (
                    <button
                      className="btn mt-4"
                      onClick={toggleShowAllReviews}
                    >
                      {showAllReviews ? 'Show Less' : 'Show All'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Enlarged Image */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Enlarged Review"
              className="max-h-[90vh] max-w-[90vw] rounded"
            />
            <button
              className="absolute right-2 top-2 rounded-full bg-white p-1 text-black hover:bg-gray-200"
              onClick={closeModal}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Only show RelatedProduct if category exists */}
      {dealData.category && <RelatedProduct category={dealData.category} />}
    </div>
  );
};

export default Deal;