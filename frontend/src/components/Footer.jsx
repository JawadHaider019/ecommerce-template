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
import { useState, useEffect } from "react"
import axios from "axios"

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Footer = () => {
    const [businessInfo, setBusinessInfo] = useState({
        company: {
            name: "Pure Clay",
            description: "Handmade organic skincare crafted from pure, natural ingredients — gentle on your skin and kind to the planet.",
            foundedYear: 2024
        },
        contact: {
            customerSupport: {
                email: "contact@pureclay.com",
                phone: "+92-300-123-4567",
            }
        },
        location: {
            displayAddress: "123 Beauty Street, Karachi, Pakistan",
            googleMapsLink: ""
        },
        socialMedia: {
            facebook: "",
            instagram: "",
            tiktok: "",
            whatsapp: ""
        },
        logos: {
            website: { url: "" }
        }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/business-details`)
                if (response.data.success && response.data.data) {
                    setBusinessInfo(response.data.data)
                }
            } catch (error) {
                // Error handling
            } finally {
                setLoading(false)
            }
        }

        if (backendUrl) {
            fetchBusinessDetails()
        } else {
            setLoading(false)
        }
    }, [])

    const socialPlatforms = [
        { 
            key: 'facebook', 
            icon: faFacebookF, 
            color: "hover:bg-blue-600",
            label: "Facebook"
        },
        { 
            key: 'instagram', 
            icon: faInstagram, 
            color: "hover:bg-pink-600",
            label: "Instagram"
        },
        { 
            key: 'tiktok', 
            icon: faTiktok, 
            color: "hover:bg-black",
            label: "TikTok"
        },
        { 
            key: 'whatsapp', 
            icon: faWhatsapp, 
            color: "hover:bg-green-600",
            label: "WhatsApp"
        }
    ]

    const currentYear = new Date().getFullYear()

    const LogoDisplay = () => {
        if (businessInfo.logos?.website?.url) {
            return (
                <img 
                    src={businessInfo.logos.website.url} 
                    alt={`${businessInfo.company?.name} Logo`} 
                    className="w-24 h-24 mb-2 object-contain rounded-2xl shadow-lg"
                    onError={(e) => {
                        e.target.src = assets.logo
                    }}
                />
            )
        }
        
        return (
            <img 
                src={assets.logo} 
                className="w-24 h-24 mb-6 rounded-2xl shadow-lg" 
                alt="Pure Clay Logo" 
            />
        )
    }

    if (loading) {
        return (
            <footer className="bg-black text-white rounded-t-3xl mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i}>
                                    <div className="h-6 bg-gray-700 rounded mb-4 w-32"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        )
    }

    return (
        <footer className="bg-black text-white rounded-t-3xl mt-20 shadow-2xl">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    
                    {/* Brand Column */}
                    <div className="space-y-2">
                        <LogoDisplay />
                        <h3 className="text-xl font-bold text-white">
                            {businessInfo.company?.name || "Pure Clay"}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {businessInfo.company?.description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-white border-b border-white pb-2 inline-block">
                            QUICK LINKS
                        </h3>
                        <ul className="space-y-3">
                            {['About', 'Products', 'Blog', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link 
                                        to={`/${item.toLowerCase()}`} 
                                        className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 block py-1"
                                    >
                                        {item.toUpperCase()}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-white border-b border-white pb-2 inline-block">
                            CONTACT US
                        </h3>
                        <div className="space-y-3 text-gray-300">
                            <div className="flex items-center space-x-3 group">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faPhone} className="text-gray-900 w-3" />
                                </div>
                                <span className="group-hover:text-white transition-colors">
                                    {businessInfo.contact?.customerSupport?.phone}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-900 w-3" />
                                </div>
                                <span className="group-hover:text-white transition-colors">
                                    {businessInfo.contact?.customerSupport?.email}
                                </span>
                            </div>
                            <div className="flex items-start space-x-3 group">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-900 w-3" />
                                </div>
                                <span className="group-hover:text-white transition-colors">
                                    {businessInfo.location?.displayAddress}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-white border-b border-white pb-2 inline-block">
                            FOLLOW US
                        </h3>
                        <div className="flex space-x-3">
                            {socialPlatforms.map((platform) => {
                                const socialUrl = businessInfo.socialMedia?.[platform.key]
                                const isActive = !!socialUrl
                                
                                return (
                                    <a
                                        key={platform.key}
                                        href={isActive ? socialUrl : "#"}
                                        target={isActive ? "_blank" : "_self"}
                                        rel={isActive ? "noopener noreferrer" : ""}
                                        className={`w-12 h-12 rounded-full bg-white ${platform.color} text-black hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border border-gray-700`}
                                        aria-label={platform.label}
                                        title={isActive ? `Follow us on ${platform.label}` : `${platform.label} coming soon`}
                                        onClick={!isActive ? (e) => e.preventDefault() : undefined}
                                    >
                                        <FontAwesomeIcon icon={platform.icon} size="lg" />
                                    </a>
                                )
                            })}
                        </div>
                        <p className="text-gray-400 text-sm mt-4">
                            {Object.values(businessInfo.socialMedia || {}).filter(url => url).length > 0 
                                ? "Stay connected for updates and exclusive offers" 
                                : "Follow us for natural beauty tips"
                            }
                        </p>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-100 pt-8">
                    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} {businessInfo.company?.name || "Pure Clay"}. All rights reserved. 
                        </p>
                        <div className="text-gray-400 text-sm px-1">
                        A Project of {" "}
                            <Link 
                                to='https://jawumitech.com/' 
                                className="text-white hover:text-gray-100 transition-colors font-medium"
                            >
                                JawumiTech
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer