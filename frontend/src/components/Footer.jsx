import { Link } from "react-router-dom"
import { assets } from "../assets/assets"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faFacebookF, 
  faInstagram, 
  faWhatsapp, 
  faTiktok,
} from "@fortawesome/free-brands-svg-icons"
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons"

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* 4 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    
                    {/* Column 1: Brand */}
                    <div>
                        <img src={assets.logo} className="w-32 mb-4" alt="Natura Bliss Logo" />
                        <p className="text-gray-600 text-sm leading-relaxed">
                        Handmade organic skincare crafted from pure, natural ingredients — gentle on your skin and kind to the planet.
                        </p>
                    </div>

                    {/* Column 2: Company Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">COMPANY</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link to="/about" className="hover:text-gray-300 transition-colors">About Us</Link></li>
                            <li><Link to="/collection" className="hover:text-gray-300 transition-colors">Our Products</Link></li>
                            <li><Link to="/blog" className="hover:text-gray-300 transition-colors">Blog</Link></li>
                                  <li><Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">CONTACT</h3>
                        <div className="space-y-3 text-gray-600 text-sm">
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faPhone} className="text-black w-4" />
                                <span>+92-333-3333</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-black w-4" />
                                <span>naturabliss@gmail.com</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-black w-4 mt-1" />
                                <span>123 Natural Street, Green Valley, PK</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Social Media */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">FOLLOW US</h3>
                        <div className="flex  space-x-3">
                            {[
                                { icon: faFacebookF, color: "bg-black", label: "Facebook" },
                                { icon: faInstagram, color: "bg-black", label: "Instagram" },
                                { icon: faTiktok, color: "bg-black", label: "TikTok" },
                                { icon: faWhatsapp, color: "bg-black", label: "WhatsApp" },
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className={`w-10 h-10 rounded-full ${social.color} text-white flex items-center justify-center transition-all hover:scale-110`}
                                    aria-label={social.label}
                                >
                                    <FontAwesomeIcon icon={social.icon} size="sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                        <p className="text-gray-600 text-sm">
                            &copy; {new Date().getFullYear()} Natura Bliss. All rights reserved.
                        </p>
                        <div className="text-gray-500 text-sm">
                            Developed by <Link to='https://jawumitech.com/' className="text-gray-700 hover:text-gray-300">JawumiTech</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer