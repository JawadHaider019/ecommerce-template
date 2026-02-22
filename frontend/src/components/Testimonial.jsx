import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaStar } from 'react-icons/fa';
import { useState, useEffect } from "react";
import Title from '../components/Title';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const Testimonial = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [slideDirection, setSlideDirection] = useState('right');
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch approved testimonials from backend
    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/testimonials`);
            if (!response.ok) throw new Error('Failed to fetch testimonials');
            const data = await response.json();
            
            // Filter only approved testimonials
            const approvedTestimonials = data.filter(testimonial => testimonial.status === 'approved');
            setTestimonials(approvedTestimonials);
        } catch (error) {
            setError('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    // Load testimonials on component mount
    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Auto-play functionality
    useEffect(() => {
        if (testimonials.length <= 1) return;
        
        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, testimonials.length]);

    const handlePrevious = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setSlideDirection('left');
        
        // Slide out
        setTimeout(() => {
            setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
            
            // Reset animation after index change
            setTimeout(() => {
                setIsAnimating(false);
            }, 50);
        }, 300);
    };

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setSlideDirection('right');
        
        // Slide out
        setTimeout(() => {
            setCurrentIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
            
            // Reset animation after index change
            setTimeout(() => {
                setIsAnimating(false);
            }, 50);
        }, 300);
    };

    const handleDotClick = (index) => {
        if (isAnimating || index === currentIndex) return;
        setIsAnimating(true);
        setSlideDirection(index > currentIndex ? 'right' : 'left');
        
        setTimeout(() => {
            setCurrentIndex(index);
            setTimeout(() => setIsAnimating(false), 50);
        }, 300);
    };

    // Get platform label for display
    const getPlatformLabel = (platform) => {
        const labels = {
            website: 'Website',
            email: 'Email',
            facebook: 'Facebook',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            whatsapp: 'WhatsApp'
        };
        return labels[platform] || 'Website';
    };

    if (loading) {
        return (
            <div className="my-16 px-4">
                <div className="text-center">
                    <Title text1={'Customer'} text2={'Testimonials'} />
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-16 px-4">
                <div className="text-center">
                    <Title text1={'Customer'} text2={'Testimonials'} />
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchTestimonials}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (testimonials.length === 0) {
        return (
            <div className="my-16 px-4">
                <div className="text-center">
                    <Title text1={'Customer'} text2={'Testimonials'} />
                </div>
                <div className="text-center py-12">
                    <p className="text-gray-600">No testimonials yet.</p>
                </div>
            </div>
        );
    }

    const currentTestimonial = testimonials[currentIndex];

    // Animation classes
    const getAnimationClass = () => {
        if (!isAnimating) return 'translate-x-0 opacity-100';
        return slideDirection === 'right' 
            ? '-translate-x-full opacity-0' 
            : 'translate-x-full opacity-0';
    };

    return (
        <div className="my-16 px-4">
            {/* Header */}
            <div className="text-center mb-10">
                <Title text1={'Customer'} text2={'Testimonials'} />
            </div>

            {/* Testimonial Card with Animation */}
            <div className="max-w-3xl mx-auto overflow-hidden">
                <div 
                    className={`transform transition-all duration-300 ease-in-out ${getAnimationClass()}`}
                >
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        {/* Rating Stars */}
                        <div className="flex justify-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <FaStar 
                                    key={i} 
                                    className={`w-5 h-5 ${
                                        i < currentTestimonial.rating 
                                            ? 'text-yellow-400' 
                                            : 'text-gray-300'
                                    }`} 
                                />
                            ))}
                        </div>

                        {/* Testimonial Content */}
                        <p className="text-lg text-gray-700 text-center leading-relaxed">
                            "{currentTestimonial.content}"
                        </p>

                        {/* Author Info */}
                        <div className="text-center mt-6">
                            <p className="font-semibold text-gray-900">
                                {currentTestimonial.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                via {getPlatformLabel(currentTestimonial.platform)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                {testimonials.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        {/* Previous Button */}
                        <button 
                            onClick={handlePrevious}
                            disabled={isAnimating}
                            className={`w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition ${
                                isAnimating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Previous testimonial"
                        >
                            <IoIosArrowBack size={18} className="text-gray-700" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDotClick(index)}
                                    disabled={isAnimating}
                                    className={`transition-all ${
                                        index === currentIndex 
                                            ? 'w-6 bg-black' 
                                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    } h-2 rounded-full ${
                                        isAnimating ? 'cursor-not-allowed' : ''
                                    }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        <button 
                            onClick={handleNext}
                            disabled={isAnimating}
                            className={`w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition ${
                                isAnimating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            aria-label="Next testimonial"
                        >
                            <IoIosArrowForward size={18} className="text-gray-700" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Testimonial;