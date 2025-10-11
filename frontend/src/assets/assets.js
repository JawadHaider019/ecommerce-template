import p_img1_1 from './p_img1_1.jpeg';
import p_img1_2 from './p_img1_2.jpeg';
import p_img1_3 from './p_img1_3.jpeg';
import p_img1_4 from './p_img1_4.jpeg';
import p_img2_1 from './p_img2_1.jpeg';
import p_img2_2 from './p_img2_2.jpeg';
import p_img2_3 from './p_img2_3.jpeg';
import p_img2_4 from './p_img2_4.jpeg';
import p_img3_1 from './p_img3_1.jpeg';
import p_img3_2 from './p_img3_2.jpeg';
import p_img3_3 from './p_img3_3.jpeg';
import p_img3_4 from './p_img3_4.jpeg';
import p_img4_1 from './p_img4_1.jpeg';
import p_img4_2 from './p_img4_2.jpeg';
import p_img4_3 from './p_img4_3.jpeg';
import p_img4_4 from './p_img4_4.jpeg';
import p_img5_1 from './p_img5_1.jpeg';
import p_img5_2 from './p_img5_2.jpeg';
import p_img5_3 from './p_img5_3.jpeg';
import p_img5_4 from './p_img5_4.jpeg';
import banner1 from './banner1.jpeg';
import banner2 from './banner2.jpeg';
import banner3 from './banner3.jpeg';
import whyus from './whyus.jpeg';
import Newsletter from './Newsletter.png';
import logo from './logo.png';
import hero_img from './hero_img.png';
import cart_icon from './cart_icon.png';
import bin_icon from './bin_icon.png';
import dropdown_icon from './dropdown_icon.png';
import exchange_icon from './exchange_icon.png';
import profile_icon from './profile_icon.png';
import quality_icon from './quality_icon.png';
import search_icon from './search_icon.png';
import star_dull_icon from './star_dull_icon.png';
import star_icon from './star_icon.png';
import support_img from './support_img.png';
import menu_icon from './menu_icon.png';
import about_img from './about_img.png';
import about_img2 from './about_img2.png';
import contact_img from './contact_img.png';
import cross_icon from './cross_icon.png';


export const assets = {
  logo,
  hero_img,
  cart_icon,
  dropdown_icon,
  exchange_icon,
  profile_icon,
  quality_icon,
  search_icon,
  star_dull_icon,
  star_icon,
  bin_icon,
  support_img,
  menu_icon,
  about_img,
  about_img2,
  contact_img,
  cross_icon,
  whyus,
  Newsletter,
};

export const bannerSlides = [
  {
    id: 1,
    image: banner1,
    headline: 'Pure. Handmade. Chemical-Free.',
    subheading: 'Experience the Bliss of Nature with our all-natural skincare products.',
    cta: 'Shop Now',
    ctaLink: '/collection',
  },
  {
    id: 2,
    image: banner2,
    headline: 'Nourish Your Skin Naturally',
    subheading: 'Discover the power of nature with our handcrafted soaps and face washes.',
    cta: 'Explore Now',
    ctaLink: '/blog',
  },
  {
    id: 3,
    image: banner3,
    headline: 'Eco-Friendly & Sustainable',
    subheading: 'Join us in our mission to protect the planet with eco-friendly packaging.',
    cta: 'Learn More',
    ctaLink: '/about',
  },
];

export const products = [
  {
    id: 'aaaaa',
    name: 'Brightening Soap',
    description:
      'Enhance your natural glow with our 95% chemical-free Brightening Soap. Reduces dark spots and tightens skin for a youthful look.',
    price: 400,
    discount: 20, 
    rating: 4.5, 
    image: [p_img1_1, p_img1_2, p_img1_3, p_img1_4],
    category: 'Soap',
    date: 1716634345448,
    bestseller: true,
    numberOfProducts: 20,
    blog: {
      publishedDate: 'Sat May 25 2024',
      ingredients: ['Activated Charcoal', 'Aloe Vera', 'Tea Tree Oil', 'Vitamin E'],
      benefits: [
        'Deeply cleanses pores',
        'Removes excess oil and impurities',
        'Reduces acne and blemishes',
        'Nourishes and hydrates skin',
      ],
      whyItsBetter:
        'Unlike other face washes that contain harsh chemicals, our Brightening Soap is made with 100% natural ingredients. It’s free from sulfates, parabens, and artificial fragrances, making it safe for daily use.',
      howToUse: [
        'Wet your face with lukewarm water.',
        'Take a small amount of the face wash and gently massage it onto your skin in circular motions.',
        'Rinse thoroughly with water.',
        'Pat your face dry with a clean towel.',
        'Use twice daily for best results.',
      ],
      extraTips: [
        'Always follow up with a moisturizer to keep your skin hydrated.',
        'Use sunscreen during the day to protect your skin from UV damage.',
        'Exfoliate your skin 2-3 times a week to remove dead skin cells.',
        'Stay hydrated and maintain a healthy diet for glowing skin.',
      ],
    },
  },
  {
    id: 'aaaab',
    name: 'Charcoal Soap',
    description:
      'Deep-cleansing activated charcoal soap that removes blackheads, whiteheads, and evens skin tone while preventing breakouts.',
    price: 400,
    discount: 15, // 15% discount
    rating: 4.2, // Rating out of 5
    image: [p_img2_1, p_img2_2, p_img2_3, p_img2_4],
    category: 'Soap',
    date: 1716621345448,
    bestseller: false,
    numberOfProducts: 0,
  },
  {
    id: 'aaaac',
    name: 'Neem Soap',
    description:
      'Fight acne and breakouts naturally with our neem-infused soap. Helps with hyperpigmentation and promotes a healthy glow.',
    price: 400,
    discount: 10, // 10% discount
    rating: 4.7, // Rating out of 5
    image: [p_img3_1, p_img3_2, p_img3_3, p_img3_4],
    category: 'Soap',
    date: 1716234545448,
    bestseller: true,
    numberOfProducts: 20,
  },
  {
    id: 'aaaad',
    name: 'Aloe Vera Face Wash',
    description:
      'A hydrating face wash enriched with aloe vera to cleanse and soothe the skin. Suitable for all skin types.',
    price: 200,
    discount: 25, // 25% discount
    rating: 4.0, // Rating out of 5
    image: [p_img4_1, p_img4_2, p_img4_3, p_img4_4],
    category: 'FaceWash',
    date: 1716621345448,
    bestseller: false,
    numberOfProducts: 20,
  },
  {
    id: 'aaaaf',
    name: 'Coconut Milk Shampoo',
    description:
      'A nourishing shampoo infused with coconut milk to hydrate and repair damaged hair. Suitable for all hair types.',
    price: 220,
    discount: 30, // 30% discount
    rating: 4.8, // Rating out of 5
    image: [p_img5_1, p_img5_2, p_img5_3, p_img5_4],
    category: 'Shampo',
    date: 1716234545448,
    bestseller: true,
    numberOfProducts: 20,
  },
];