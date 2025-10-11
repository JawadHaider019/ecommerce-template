import Title from '../components/Title';
import { FaFacebook, FaInstagram, FaTiktok} from 'react-icons/fa';
const Contact = () => {
  return (
    <div className="border-t pt-14">
      <div className="text-center text-2xl">
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className="mt-8 px-4 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          {/* Contact Form */}
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-black">Send Us a Message</h3>
            <form>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name "
                  className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address "
                  className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number "
                className="mt-4 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <select 
                className="mt-4 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black" 
                required
              >
                <option value="">Subject/Reason for Inquiry</option>
                <option value="bluk order">Bulk Order</option>
                <option value="general">General Inquiry</option>
                <option value="order">Order Support</option>
                <option value="feedback">Feedback</option>
                <option value="suggestions">Suggestions</option>
                <option value="partnership">Partnership</option>
                <option value="technical Support">Technical Support</option>
                <option value="shipping & delivery Issues">Shipping & Delivery Issues</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Your Message"
                rows="4"
                className="mt-4 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                required
              ></textarea>
              <button
                type="submit"
                className="btn mt-5"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Warehouse Locations */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Location 1 */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-xl font-semibold text-black">Warehouse & Production Center</h3>
              <p className="text-gray-600">Talagang</p>
              <p className="text-gray-600">Phone: +923333333333</p>
              <div className="mt-4">
             
                <iframe
                  title="Warehouse & Production Center"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53581.37547067252!2d72.36579725668948!3d32.92893183501323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3920949ad1b6438b%3A0x7807a1c59442d6de!2sTalagang%2C%20Pakistan!5e0!3m2!1sen!2s!4v1742395541712!5m2!1sen!2s" 
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
            
            {/* Location 2 */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-xl font-semibold text-black">Warehouse & Operations Center</h3>
              <p className="text-gray-600">Chakwal</p>
              <p className="text-gray-600">Phone: +923333333333</p>
              <div className="mt-4">
                <iframe
                  title="Warehouse & Operations Center"
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53580.27593036064!2d72.80218180671129!3d32.93074723334285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39205d0b0f9d67b3%3A0xfb3c76a4496ca679!2sChakwal%2C%20Pakistan!5e0!3m2!1sen!2s!4v1742395637776!5m2!1sen!2s"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-black">Get in Touch</h3>
            <p className="mt-2 text-gray-600">Email: support@shopease.com</p>
            <p className="mt-2 text-gray-600">Phone: +1 (800) 123-4567</p>
            <p className="mt-2 text-gray-600">Business Hours: Mon-Fri, 9 AM - 5 PM</p>
          </div>

          <div className="mt-8 text-center">
            <h3 className="mb-4 text-xl font-semibold text-black">Follow Us</h3>
            <div className="flex justify-center space-x-6 text-2xl text-gray-600">
              <a href="#" className="hover:text-blue-600"><FaFacebook /></a>
              <a href="#" className="hover:text-pink-600"><FaInstagram /></a>
              <a href="#" className="hover:text-red-600"><FaTiktok /></a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Contact;