import { useParams } from "react-router-dom";
import { useContext } from "react";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";

const BlogPost = () => {

      const { products, currency } = useContext(ShopContext);
  const { id } = useParams();
  const product = products.find((prod) => prod.id === id);

  if (!product) {
    return <h2 className="mt-10 text-center text-red-500">Product Not Found</h2>;
  }

  return (
    <div className="border-t px-6 pt-14 md:px-20">
      <div className="text-center text-2xl">
        <Title text1={"PRODUCT"} text2={"DETAILS"} />
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <img
          src={product.image[0]}
          alt={product.name}
          className="h-72 w-full rounded-lg object-cover"
        />
        <h1 className="mt-6 text-3xl font-bold text-gray-800">{product.name}</h1>
        <p className="mt-2 text-gray-500">Published on {new Date(product.date).toDateString()}</p>
        <p className="mt-6 leading-7 text-gray-700">{product.description}</p>
        <p className="mt-4 text-lg font-semibold text-green-700">Price: {currency}{product.price}</p>

        {/* Ingredients */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-black">Ingredients</h3>
          <ul className="mt-2 list-inside list-disc text-gray-600">
            <li>Activated Charcoal</li>
            <li>Aloe Vera</li>
            <li>Tea Tree Oil</li>
            <li>Vitamin E</li>
          </ul>
        </div>

        {/* Benefits */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-black">Benefits</h3>
          <ul className="mt-2 list-inside list-disc text-gray-600">
            <li>Deeply cleanses pores</li>
            <li>Removes excess oil and impurities</li>
            <li>Reduces acne and blemishes</li>
            <li>Nourishes and hydrates skin</li>
          </ul>
        </div>

        {/* Why It’s Better */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-black">Why It’s Better</h3>
          <p className="mt-2 text-gray-600">
            Unlike other face washes that contain harsh chemicals, our {product.name} is made with 100% natural ingredients. It’s free from sulfates, parabens, and artificial fragrances, making it safe for daily use.
          </p>
        </div>

        {/* How to Use */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-black">How to Use</h2>
          <ol className="mt-4 list-inside list-decimal text-gray-600">
            <li>Wet your face with lukewarm water.</li>
            <li>Take a small amount of the face wash and gently massage it onto your skin in circular motions.</li>
            <li>Rinse thoroughly with water.</li>
            <li>Pat your face dry with a clean towel.</li>
            <li>Use twice daily for best results.</li>
          </ol>
        </div>

        {/* Extra Skincare Tips */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-black">Extra Skincare Tips</h2>
          <ul className="mt-4 list-inside list-disc text-gray-600">
            <li>Always follow up with a moisturizer to keep your skin hydrated.</li>
            <li>Use sunscreen during the day to protect your skin from UV damage.</li>
            <li>Exfoliate your skin 2-3 times a week to remove dead skin cells.</li>
            <li>Stay hydrated and maintain a healthy diet for glowing skin.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
