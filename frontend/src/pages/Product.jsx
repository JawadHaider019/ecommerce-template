import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProduct from '../components/RelatedProduct';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
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

  // Fetch product data
  useEffect(() => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
    }
  }, [productId, products]);

  const stock = productData ? productData.quantity : 0;

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
      id: Date.now(), // Use timestamp for unique ID
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

  if (!productData) {
    return <div>Loading...</div>;
  }

  const discountPrice = productData.discount 
    ? productData.price * (1 - productData.discount / 100) 
    : null;

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
    addToCart(productData._id, quantity);
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

  return (
    <div className="border-t-2 pt-10">
      <div className="flex flex-col gap-12 sm:flex-row sm:gap-12">
        <div className="flex flex-1 flex-col-reverse gap-3 sm:flex-row">
          {/* Thumbnail Images */}
          <div className="flex w-full justify-between overflow-x-auto sm:w-[18%] sm:flex-col sm:justify-normal sm:overflow-y-auto">
            {productData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt={`Product Thumbnail ${index + 1}`}
                className="w-[24%] shrink-0 cursor-pointer sm:mb-3 sm:w-full"
                onClick={() => setImage(item)} 
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full sm:w-4/5">
            {/* Discount Badge */}
            {productData.discount && (
              <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                {productData.discount}% OFF
              </div>
            )}
            <img
              src={image}
              alt="Main Product"
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="mt-2 text-2xl font-medium">{productData.name}</h1>
          <div className="mt-2 flex items-center gap-1">
            {renderRating(productData.rating || 0)} 
            <p className="pl-2">{(productData.rating || 0).toFixed(1)}</p>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <p className="text-3xl font-medium">
              {currency} { productData.discountprice.toFixed(2)}
            </p>
            
              <p className="text-sm text-gray-500 line-through">
                {currency} {productData.price.toFixed(2)}
              </p>
          
          </div>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
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
            {stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="mt-5 flex flex-col gap-1 text-sm text-gray-500">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
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
            <p>{productData.description}</p>
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

      <RelatedProduct category={productData.category} />
    </div>
  );
};

export default Product;