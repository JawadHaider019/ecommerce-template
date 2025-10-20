import BestSeller from "../components/BestSeller"
import Hero from "../components/Hero"
import LatestCollection from "../components/LatestCollection"
import NewsletterBox from "../components/NewsletterBox"
import OurPolicy from "../components/OurPolicy"
import Testimonial from '../components/Testimonial'
import WhyChooseUs from "../components/WhyChooseUs"
import DealCollection from "../components/DealCollection"

const Home = () => {
  return (
    <div>
      <Hero/>
      <DealCollection />
      <LatestCollection/>
      <BestSeller/>
      <WhyChooseUs/>
      <Testimonial/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
