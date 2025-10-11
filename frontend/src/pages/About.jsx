import Title from '../components/Title';
import { assets } from '../assets/assets';
import { FaLeaf, FaHands, FaShieldAlt, FaRecycle } from 'react-icons/fa'; 
import Testimonial from '../components/Testimonial';

import NewsletterBox from '../components/NewsletterBox'

const teamMembers = [
  {
    name: 'John Doe',
    role: 'Founder & CEO',
    bio: 'Passionate about natural skincare and sustainability. John has over 10 years of experience in the beauty industry and is dedicated to creating products that are both effective and eco-friendly.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
  },
  {
    name: 'Jane Smith',
    role: 'Co Founder',
    bio: 'Jane loves experimenting with natural ingredients to create effective products. With a background in chemistry, she ensures every product is safe and beneficial for your skin.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
  },
  {
    name: 'Alice Johnson',
    role: 'Marketing Director',
    bio: 'Alice believes in spreading the word about clean, honest self-care. She is passionate about connecting with customers and sharing the Natura Bliss story.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
  }
];


const About = () => {
  
  return (
    <div className="border-t pt-14">
      {/* Page Title */}
      <div className="text-center text-2xl">
        <Title text1={'ABOUT'} text2={'US'} />
      </div>
      <div className="p-8 sm:mx-4 lg:mx-36">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <img
              className="w-full"
              src={assets.about_img}
              alt="Natura Bliss Story - Pakistan’s First All-Natural Personal Care Brand"
            />
          </div>

          {/* Story Content */}
          <div className="flex flex-col gap-4 text-[-15px] text-gray-600">
            <div className="text-center text-2xl">
              <Title text1={'The Bliss Natura'} text2={' Story'} />
            </div>
            <p>
              <strong>
                <em>
                  The Story Behind How Pakistan’s First All-Natural Personal Care Brand Came to Be...
                </em>
              </strong>
            </p>
            <p>
              For years, we struggled to find truly natural personal care products—soaps, shampoos, and toothpaste that were actually free from harsh chemicals and safe for everyday use.
            </p>
            <p>
              Like many others, we were frustrated with the endless search for truly <strong>natural</strong> personal care products. Every shampoo, soap, and toothpaste claimed to be “organic” and “gentle,” but a quick look at the ingredients told a different story—<strong>harsh chemicals, artificial fragrances, and harmful preservatives.</strong>
            </p>
            <p>
              We knew there had to be a better way. So, we started experimenting. We tested different <strong>natural ingredients</strong>—<strong>charcoal for detox, neem for cleansing, coconut oil for nourishment, and herbal extracts for healing.</strong> Some formulas worked beautifully, while others failed. But after countless trials and late-night research sessions, we finally got it right.
            </p>
            <p>
              The result? A line of <strong>pure, handcrafted personal care products</strong>—<strong>free from harmful chemicals, packed with natural goodness, and designed to deliver real results.</strong>
            </p>
            <p>
              And thus, <strong>Natura Bliss</strong> was born. All products under the Natura Bliss name are made with <strong>carefully selected natural ingredients</strong> and backed by research to ensure they <strong>nourish, protect, and enhance your skin, hair, and overall well-being.</strong>
            </p>
            <p>
              Natura Bliss isn’t just a brand—it’s a movement toward <strong>clean, honest, and effective self-care.</strong> Welcome to a world where nature takes care of you. 🌿✨
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <img
          className="size-full object-cover"
          src={assets.about_img2}
          alt="Natura Bliss Hero Banner"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <h2 className="text-center text-4xl font-bold uppercase text-white">
            Pure. Handmade. Chemical-Free.
            <br />
            Experience the Bliss of Nature.
          </h2>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="p-8 sm:mx-4 lg:mx-8">
        <div className="flex w-full flex-col justify-center gap-4 text-center text-gray-600">
          <div className="text-center text-2xl">
            <Title text1={'OUR'} text2={'MISSION'} />
          </div>
          <p className="text-[15px]">
            At Natura Bliss, our mission is to provide <strong>pure, handmade, and chemical-free</strong> personal care products that nourish and protect your skin and hair. We believe in the power of nature to heal and enhance, and we’re committed to creating products that are safe for you and the planet.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="p-8 sm:mx-4 lg:mx-8">
        <div className="text-center text-2xl">
          <Title text1={'WHY'} text2={'CHOOSE US?'} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Natural Ingredients */}
          <div className="p-6 transition-shadow hover:shadow-lg">
            <div className="text-center">
              <FaLeaf className="mx-auto size-12 text-green-600" /> {/* Leaf icon */}
              <h3 className="mt-4 text-lg font-semibold text-black">Natural Ingredients</h3>
              <p className="mt-2 text-sm text-gray-600">
                Our products are made with 100% natural ingredients, free from harsh chemicals.
              </p>
            </div>
          </div>
          {/* Card 2: Handmade Care */}
          <div className="p-6 transition-shadow hover:shadow-lg">
            <div className="text-center">
              <FaHands className="mx-auto size-12 text-orange-500" /> {/* Hands icon */}
              <h3 className="mt-4 text-lg font-semibold text-black">Handmade Care</h3>
              <p className="mt-2 text-sm text-gray-600">
                Each product is carefully handcrafted with love and attention to detail.
              </p>
            </div>
          </div>
          {/* Card 3: Safe for All */}
          <div className="p-6 transition-shadow hover:shadow-lg">
            <div className="text-center">
              <FaShieldAlt className="mx-auto size-12 text-blue-500" /> {/* Shield icon */}
              <h3 className="mt-4 text-lg font-semibold text-black">Safe for All</h3>
              <p className="mt-2 text-sm text-gray-600">
                Our products are gentle and safe for all skin types, including sensitive skin.
              </p>
            </div>
          </div>
          {/* Card 4: Eco-Friendly */}
          <div className="p-6 transition-shadow hover:shadow-lg">
            <div className="text-center">
              <FaRecycle className="mx-auto size-12 text-green-700" /> {/* Recycle icon */}
              <h3 className="mt-4 text-lg font-semibold text-black">Eco-Friendly</h3>
              <p className="mt-2 text-sm text-gray-600">
                We’re committed to sustainability and use eco-friendly packaging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Team Section */}
      <div className="p-8 sm:mx-4 lg:mx-8">
        <div className="text-center text-2xl">
          <Title text1={'MEET THE'} text2={'TEAM'} />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              <img
                className="h-64 w-full object-cover"
                src={member.image}
                alt={member.name}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-black">{member.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{member.role}</p>
                <p className="mt-4 text-sm text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Section */}
    <Testimonial/>

      <NewsletterBox/>
    </div>
  );
};

export default About;
