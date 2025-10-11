import { assets } from "../assets/assets";

const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className="relative w-full bg-cover bg-center px-6 py-16"
      style={{ backgroundImage: `url(${assets.Newsletter})` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl text-center text-white">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Subscribe now & get 10% off
        </h2>
        <p className="mt-3 text-lg text-gray-300">
          Get exclusive deals, skincare tips, and early access to new products.
        </p>

        {/* Subscription Form */}
        <form 
          onSubmit={onSubmitHandler} 
          className="mx-auto mt-6 flex w-full flex-row items-center gap-3  rounded-full bg-white p-1"
        >
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full flex-1 rounded-full px-4 py-3 text-gray-700 outline-none" 
            required
          />
          <button 
            type="submit" 
            className="rounded-full bg-black px-6 py-3 font-medium text-white transition-all hover:bg-gray-300"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterBox;
