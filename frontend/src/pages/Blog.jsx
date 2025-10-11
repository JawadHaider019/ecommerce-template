import { Link } from "react-router-dom";
import Title from "../components/Title";
import { FaCalendarAlt } from "react-icons/fa";
import { products } from "../assets/assets"; // Import products

const Blog = () => {
  return (
    <div className="border-t px-6 pt-14 md:px-20">
      <div className="text-center text-2xl">
        <Title text1={"OUR"} text2={"BLOG"} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/blog/${product.id}`} 
            className="block overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <img
              src={product.image[0]} // Show the first image from the array
              alt={product.name}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
              <div className="mt-2 flex items-center text-gray-500">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(product.date).toDateString()}</span>
              </div>
              <p className="mt-4 text-gray-600">{product.description.slice(0, 80)}...</p>
              <span className="mt-4 inline-block font-semibold text-green-600 hover:underline">
                Read More →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
