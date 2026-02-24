// components/Loader.jsx
import { assets } from '../assets/assets';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <div className="relative flex items-center justify-center">
        {/* Thin animated border */}
        <div className="w-32 h-32 rounded-full border-2 border-gray-300 border-t-black animate-spin"></div>
        
        {/* Large logo - perfectly centered */}
        <img 
          src={assets.logo} 
          alt="Loading" 
          className="w-28 h-28 absolute object-contain"
          style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}
          loading="eager"
          width={112}
          height={112}
        />
      </div>
    </div>
  );
};

export default Loader;