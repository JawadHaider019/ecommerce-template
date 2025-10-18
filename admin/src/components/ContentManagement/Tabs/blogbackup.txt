import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, faEdit, faTrash, faPlus, faVideo, faImage, faLink,
  faTimes, faEye, faPaperPlane, faBold, faItalic, faListUl,
  faListOl, faQuoteLeft, faCode, faHeading, faPalette, faSearch,
  faCalendar, faUser, faTags, faPlay, faUpload, faEyeSlash,
  faGlobe, faBookmark, faClock, faSpinner, faInfoCircle, faExclamationTriangle,
  faExternalLinkAlt, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faInstagram, 
  faTiktok, 
  faYoutube 
} from '@fortawesome/free-brands-svg-icons';

// Custom Alert Component
const CustomAlert = ({ type, message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const alertStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-gray-400'
  };

  const icons = {
    success: faCheck,
    error: faExclamationTriangle,
    warning: faExclamationTriangle,
    info: faInfoCircle
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 border rounded-lg shadow-lg transform transition-all duration-300 ${alertStyles[type]}`}>
      <FontAwesomeIcon icon={icons[type]} className={`mr-3 ${iconStyles[type]}`} />
      <div className="text-sm font-medium">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-auto bg-transparent hover:opacity-70 transition-opacity"
      >
        <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  );
};

// Enhanced Markdown renderer component
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const renderFormattedContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let inList = false;
    let listType = '';
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc ml-6 mb-4 space-y-2 text-gray-700">
              {listItems.map((item, idx) => (
                <li key={`${idx}-${Date.now()}`} className="leading-relaxed">{renderInlineFormatting(item)}</li>
              ))}
            </ul>
          );
        } else if (listType === 'ol') {
          elements.push(
            <ol key={`list-${elements.length}`} className="list-decimal ml-6 mb-4 space-y-2 text-gray-700">
              {listItems.map((item, idx) => (
                <li key={`${idx}-${Date.now()}`} className="leading-relaxed">{renderInlineFormatting(item)}</li>
              ))}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    const renderInlineFormatting = (line) => {
      if (!line) return line;
      
      let processedLine = line;
      
      processedLine = processedLine.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>');
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
      
      return <span dangerouslySetInnerHTML={{ __html: processedLine }} />;
    };

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={`h1-${index}`} className="text-3xl font-bold text-gray-900 mt-6 mb-4 leading-tight">{line.substring(2)}</h1>);
      } 
      else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`h2-${index}`} className="text-2xl font-bold text-gray-800 mt-5 mb-3 leading-tight">{line.substring(3)}</h2>);
      }
      else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={`h3-${index}`} className="text-xl font-semibold text-gray-800 mt-4 mb-2 leading-tight">{line.substring(4)}</h3>);
      }
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`blockquote-${index}`} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4 bg-gray-50 py-3 px-4 rounded-r text-base">
            {renderInlineFormatting(line.substring(2))}
          </blockquote>
        );
      }
      else if (line.startsWith('- ')) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(line.substring(2));
      }
      else if (line.match(/^\d+\. /)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        const itemText = line.replace(/^\d+\. /, '');
        listItems.push(itemText);
      }
      else if (line.trim().startsWith('```')) {
        if (!line.trim().endsWith('```')) {
          elements.push(<div key={`code-${index}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto" />);
        }
      }
      else if (line.trim()) {
        flushList();
        elements.push(<p key={`p-${index}`} className="mb-4 text-gray-700 leading-relaxed text-base">{renderInlineFormatting(line)}</p>);
      }
      else {
        flushList();
        if (elements.length > 0) {
          elements.push(<br key={`br-${index}`} />);
        }
      }
    });

    flushList();
    return elements;
  };

  return <div className="prose max-w-none text-gray-700">{renderFormattedContent(content)}</div>;
};

// Enhanced Instagram Embed Component with Reels support
const InstagramEmbed = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [correctedUrl, setCorrectedUrl] = useState('');

  // Function to correct Instagram URL format for embedding
  const correctInstagramUrl = (inputUrl) => {
    try {
      // Convert reels URL to standard post URL (required for embedding)
      if (inputUrl.includes('/reels/')) {
        const reelId = inputUrl.split('/reels/')[1]?.split('/')[0]?.split('?')[0];
        if (reelId) {
          return `https://www.instagram.com/p/${reelId}/`;
        }
      }
      
      // Convert TV URL to standard post URL
      if (inputUrl.includes('/tv/')) {
        const tvId = inputUrl.split('/tv/')[1]?.split('/')[0]?.split('?')[0];
        if (tvId) {
          return `https://www.instagram.com/p/${tvId}/`;
        }
      }
      
      // Ensure it's a proper Instagram post URL
      if (inputUrl.includes('/p/') || inputUrl.includes('/reel/')) {
        return inputUrl.split('?')[0]; // Remove query parameters
      }
      
      return inputUrl;
    } catch (error) {
      return inputUrl;
    }
  };

  const loadInstagramScript = useCallback(() => {
    setLoading(true);
    setError(false);

    // Correct the URL first for proper embedding
    const fixedUrl = correctInstagramUrl(url);
    setCorrectedUrl(fixedUrl);

    // Clean up any existing script
    const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    
    script.onload = () => {
      if (window.instgrm) {
        try {
          window.instgrm.Embeds.process();
          // Check if embed was actually processed
          setTimeout(() => {
            const instagramEmbeds = document.querySelectorAll('.instagram-media');
            const hasLoaded = instagramEmbeds.length > 0 && 
                             instagramEmbeds[0].offsetHeight > 0;
            
            if (!hasLoaded && retryCount < 3) {
              handleScriptError();
            } else {
              setLoading(false);
            }
          }, 3000);
        } catch (err) {
          handleScriptError();
        }
      } else {
        handleScriptError();
      }
    };
    
    script.onerror = handleScriptError;
    
    document.body.appendChild(script);

    // Fallback timeout
    const timeoutId = setTimeout(() => {
      if (loading) {
        handleScriptError();
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [url, retryCount]);

  const handleScriptError = () => {
    setError(true);
    setLoading(false);
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 2000);
    }
  };

  // Alternative method: Create embed using iframe for better Reels support
  const createFallbackEmbed = () => {
    // Extract post ID from corrected URL
    const postMatch = correctedUrl.match(/instagram\.com\/p\/([^/?]+)/);
    const reelMatch = url.match(/instagram\.com\/reels?\/([^/?]+)/);
    
    const postId = postMatch ? postMatch[1] : (reelMatch ? reelMatch[1] : null);
    
    if (postId) {
      return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
          <iframe
            src={`https://www.instagram.com/p/${postId}/embed/captioned/`}
            className="w-full h-[600px] border-0"
            scrolling="no"
            frameBorder="0"
            allow="encrypted-media"
            allowFullScreen
            title="Instagram Post"
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }
    
    return null;
  };

  useEffect(() => {
    if (retryCount > 0) {
      loadInstagramScript();
    }
  }, [retryCount, loadInstagramScript]);

  useEffect(() => {
    const cleanup = loadInstagramScript();
    return cleanup;
  }, [loadInstagramScript]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-black mr-3" />
        <span>Loading Instagram post...{retryCount > 0 && ` (Retry ${retryCount}/2)`}</span>
      </div>
    );
  }

  if (error) {
    const fallbackEmbed = createFallbackEmbed();
    
    return (
      <div className="space-y-4">
        {fallbackEmbed ? (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">
                  Using fallback Instagram embed for Reel
                </span>
              </div>
            </div>
            {fallbackEmbed}
          </>
        ) : (
          <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">Unable to load Instagram Reel</p>
            <p className="text-gray-500 text-sm mb-4">
              Try using the standard post URL format: instagram.com/p/...
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
              View on Instagram
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <blockquote 
        className="instagram-media" 
        data-instgrm-captioned 
        data-instgrm-permalink={correctedUrl}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: '1px solid #dbdbdb',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          margin: '0',
          maxWidth: '540px',
          minWidth: '326px',
          padding: '0',
          width: '99.375%'
        }}
      >
        <a href={correctedUrl} target="_blank" rel="noopener noreferrer">
          Loading Instagram Post...
        </a>
      </blockquote>
    </div>
  );
};

// Smart Video Embed Component - Automatically detects platform and generates embed code
const SmartVideoEmbed = ({ url }) => {
  const [loading, setLoading] = useState(false);
  const [embedInfo, setEmbedInfo] = useState(null);

  // Platform Detection and Embed Code Generator
  const detectPlatformAndGenerateEmbed = (url) => {
    try {
      // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtube.com/shorts/')) {
          videoId = url.split('shorts/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        
        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          return {
            platform: 'YouTube',
            type: 'embed',
            title: 'YouTube Video',
            icon: faYoutube,
            color: 'text-red-600',
            embedCode: (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video player"
                />
              </div>
            )
          };
        }
      }
      
      // TikTok
      if (url.includes('tiktok.com')) {
        const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/(\d+)/;
        const match = url.match(tiktokRegex);
        const videoId = match ? match[2] : null;
        
        if (videoId) {
          const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
          return {
            platform: 'TikTok',
            type: 'embed',
            title: 'TikTok Video',
            icon: faTiktok,
            color: 'text-black',
            embedCode: (
              <div className="w-full aspect-[9/16] bg-black rounded-lg overflow-hidden max-w-md mx-auto">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allow="encrypted-media"
                  title="TikTok video"
                />
              </div>
            )
          };
        }
      }
      
      // Instagram - Using enhanced Instagram embed with Reels support
      if (url.includes('instagram.com')) {
        const instaRegex = /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/;
        const match = url.match(instaRegex);
        
        if (match) {
          const isReel = url.includes('/reel') || url.includes('/reels/');
          return {
            platform: 'Instagram',
            type: 'embed',
            title: isReel ? 'Instagram Reel' : 'Instagram Post',
            icon: faInstagram,
            color: 'text-pink-600',
            embedCode: <InstagramEmbed url={url} />
          };
        }
      }
      
      // Facebook
      if (url.includes('facebook.com') || url.includes('fb.watch')) {
        const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=500`;
        return {
          platform: 'Facebook',
          type: 'embed',
          title: 'Facebook Video',
          icon: faFacebookF,
          color: 'text-blue-600',
          embedCode: (
            <div className="w-full aspect-video bg-white rounded-lg overflow-hidden border border-gray-300">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                scrolling="no"
                allow="encrypted-media"
                allowFullScreen
                title="Facebook video"
              />
            </div>
          )
        };
      }
      
      // Vimeo
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('/').pop();
        if (videoId) {
          const embedUrl = `https://player.vimeo.com/video/${videoId}`;
          return {
            platform: 'Vimeo',
            type: 'embed',
            title: 'Vimeo Video',
            icon: faVideo,
            color: 'text-blue-400',
            embedCode: (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Vimeo video"
                />
              </div>
            )
          };
        }
      }
      
      // Direct video files
      if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|3gp)$/i)) {
        return {
          platform: 'Video File',
          type: 'direct',
          title: 'Video File',
          icon: faVideo,
          color: 'text-green-600',
          embedCode: (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                controls 
                className="w-full h-full"
                poster="/api/placeholder/800/450"
              >
                <source src={url} type={`video/${url.split('.').pop()}`} />
                Your browser does not support the video tag.
              </video>
            </div>
          )
        };
      }
      
      // Unsupported URL - Show link card
      return {
        platform: 'External Link',
        type: 'external',
        title: 'External Content',
        icon: faLink,
        color: 'text-gray-600',
        embedCode: (
          <div className="w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center p-6">
              <FontAwesomeIcon icon={faLink} className="text-4xl text-gray-400 mb-3" />
              <h5 className="text-lg font-semibold text-gray-700 mb-2">External Content</h5>
              <p className="text-gray-600 mb-4">This link cannot be embedded automatically</p>
              <a href={url} target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FontAwesomeIcon icon={faPlay} className="mr-2" />
                Visit Link
              </a>
            </div>
          </div>
        )
      };
      
    } catch (error) {
      return {
        platform: 'Error',
        type: 'error',
        title: 'Error Processing URL',
        icon: faExclamationTriangle,
        color: 'text-red-500',
        embedCode: (
          <div className="w-full aspect-video bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-500 mb-2" />
              <p className="text-red-700">Failed to process video URL</p>
            </div>
          </div>
        )
      };
    }
  };

  useEffect(() => {
    if (url) {
      setLoading(true);
      setTimeout(() => {
        const info = detectPlatformAndGenerateEmbed(url);
        setEmbedInfo(info);
        setLoading(false);
      }, 800);
    }
  }, [url]);

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-black mr-3" />
          <span className="text-gray-700">Detecting platform and generating embed code...</span>
        </div>
      </div>
    );
  }

  if (!embedInfo) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <FontAwesomeIcon icon={embedInfo.icon} className={`mr-2 ${embedInfo.color}`} />
          {embedInfo.title}
        </h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${embedInfo.color} bg-opacity-10`}>
            Auto-detected: {embedInfo.platform}
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" 
             className="text-gray-400 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
        {/* Automatically Generated Embed Code */}
        <div className="flex justify-center p-4">
          {embedInfo.embedCode}
        </div>
        
        {/* Platform Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <FontAwesomeIcon icon={embedInfo.icon} className={`mr-1 ${embedInfo.color}`} />
              {embedInfo.platform}
            </span>
            <span className="text-xs text-gray-500">
              Embedded automatically from {embedInfo.platform}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Preview Modal Component
const VideoPreviewModal = ({ url, onClose }) => {
  if (!url) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Video Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <SmartVideoEmbed url={url} />
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced BlogsTab Component with Video Management Features
const BlogsTab = ({ blogs, setBlogs, categories }) => {
  const [newBlog, setNewBlog] = useState({ 
    title: '', content: '', excerpt: '', category: '', subcategory: '',
    videoUrl: '', imageUrl: '', videoFile: null, tags: [], author: 'Admin',
    readTime: '1', featured: false, metaDescription: ''
  });
  const [editingBlog, setEditingBlog] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [previewUrl, setPreviewUrl] = useState('');
  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const contentTextareaRef = useRef(null);
  const editContentTextareaRef = useRef(null);

  // Add alert function
  const addAlert = (type, message, duration = 5000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message, duration }]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Calculate read time
  useEffect(() => {
    const readTime = calculateReadTime(newBlog.content);
    setNewBlog(prev => ({ ...prev, readTime: readTime.toString() }));
  }, [newBlog.content]);

  // Enhanced blog filtering with video support
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    
    // Content type filtering
    const hasVideo = blog.videoUrl && blog.videoUrl.trim() !== '';
    const hasImage = blog.imageUrl && blog.imageUrl.trim() !== '';
    
    let matchesContentType = true;
    if (contentTypeFilter === 'video') {
      matchesContentType = hasVideo;
    } else if (contentTypeFilter === 'image') {
      matchesContentType = hasImage && !hasVideo;
    } else if (contentTypeFilter === 'text-only') {
      matchesContentType = !hasVideo && !hasImage;
    }
    
    return matchesSearch && matchesStatus && matchesContentType;
  });

  // Smart URL detection
  const handleVideoUrlInput = async () => {
    const url = prompt('Enter video URL (YouTube, TikTok, Instagram, Facebook, Vimeo, or direct video file):');
    if (url) {
      setIsFetchingVideo(true);
      addAlert('info', 'Analyzing URL and generating embed code...');
      
      try {
        setNewBlog({...newBlog, videoUrl: url });
        setPreviewUrl(url);
        
        // Show platform-specific success message
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          addAlert('success', '✅ YouTube video detected! Embed code generated automatically.');
        } else if (url.includes('tiktok.com')) {
          addAlert('success', '✅ TikTok video detected! Embed code generated automatically.');
        } else if (url.includes('instagram.com')) {
          addAlert('success', '✅ Instagram content detected! Embed code generated automatically.');
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
          addAlert('success', '✅ Facebook video detected! Embed code generated automatically.');
        } else if (url.includes('vimeo.com')) {
          addAlert('success', '✅ Vimeo video detected! Embed code generated automatically.');
        } else if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
          addAlert('success', '✅ Video file detected! HTML5 player generated automatically.');
        } else {
          addAlert('info', '🔗 Link added. Smart embed will attempt to display content.');
        }
      } catch (error) {
        addAlert('error', '❌ Failed to process URL.');
      } finally {
        setIsFetchingVideo(false);
      }
    }
  };

  // Paste handler with auto-detection
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.match(/(youtube|youtu\.be|tiktok|instagram|facebook|vimeo|\.(mp4|webm|mov|avi))/i)) {
      e.preventDefault();
      setIsFetchingVideo(true);
      addAlert('info', '🔍 Auto-detecting platform from pasted URL...');
      
      setTimeout(() => {
        setNewBlog(prev => ({ ...prev, videoUrl: pastedText }));
        setPreviewUrl(pastedText);
        setIsFetchingVideo(false);
        
        if (pastedText.includes('youtube.com') || pastedText.includes('youtu.be')) {
          addAlert('success', '✅ YouTube video auto-detected! Embedded successfully.');
        } else if (pastedText.includes('tiktok.com')) {
          addAlert('success', '✅ TikTok video auto-detected! Embedded successfully.');
        } else if (pastedText.includes('instagram.com')) {
          addAlert('success', '✅ Instagram content auto-detected! Embedded successfully.');
        } else if (pastedText.includes('facebook.com')) {
          addAlert('success', '✅ Facebook video auto-detected! Embedded successfully.');
        } else {
          addAlert('success', '✅ URL processed! Smart embed activated.');
        }
      }, 1000);
    }
  };

  // File upload handlers
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      simulateUploadProgress(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewBlog({...newBlog, imageUrl: e.target.result });
          addAlert('success', 'Image uploaded successfully!');
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/') && file.size <= 100 * 1024 * 1024) {
      setIsVideoProcessing(true);
      simulateUploadProgress(() => {
        const videoUrl = URL.createObjectURL(file);
        setNewBlog({ ...newBlog, videoFile: file, videoUrl });
        setPreviewUrl(videoUrl);
        setIsVideoProcessing(false);
        addAlert('success', 'Video uploaded successfully! HTML5 player generated.');
      });
    } else if (file && file.size > 100 * 1024 * 1024) {
      addAlert('error', 'Video file too large. Maximum size is 100MB.');
    }
  };

  const simulateUploadProgress = (callback) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          callback();
          return 0;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !newBlog.tags.includes(newTag.trim())) {
      setNewBlog({...newBlog, tags: [...newBlog.tags, newTag.trim()]});
      setNewTag('');
      addAlert('success', 'Tag added!');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewBlog({...newBlog, tags: newBlog.tags.filter(tag => tag !== tagToRemove)});
    addAlert('info', 'Tag removed!');
  };

  // Formatting tools
  const insertFormatting = (format, isEditMode = false) => {
    const textarea = isEditMode ? editContentTextareaRef.current : contentTextareaRef.current;
    const content = isEditMode ? editingBlog.content : newBlog.content;
    const setContent = isEditMode ? 
      (content) => setEditingBlog({...editingBlog, content}) : 
      (content) => setNewBlog({...newBlog, content});

    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold': formattedText = `**${selectedText}**`; cursorOffset = 2; break;
      case 'italic': formattedText = `*${selectedText}*`; cursorOffset = 1; break;
      case 'bold-italic': formattedText = `***${selectedText}***`; cursorOffset = 3; break;
      case 'heading': formattedText = `# ${selectedText}`; cursorOffset = 2; break;
      case 'quote': formattedText = `> ${selectedText}`; cursorOffset = 2; break;
      case 'code': formattedText = `\`${selectedText}\``; cursorOffset = 1; break;
      case 'ul': formattedText = `- ${selectedText}`; cursorOffset = 2; break;
      case 'ol': 
        const currentLineStart = content.lastIndexOf('\n', start) + 1;
        const currentLineEnd = content.indexOf('\n', start);
        const currentLine = content.substring(currentLineStart, currentLineEnd === -1 ? content.length : currentLineEnd);
        const olMatch = currentLine.match(/^(\d+)\.\s/);
        formattedText = olMatch ? `${parseInt(olMatch[1]) + 1}. ${selectedText}` : `1. ${selectedText}`;
        cursorOffset = 4;
        break;
      default: formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + (selectedText ? cursorOffset + selectedText.length : formattedText.length);
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Helper functions
  const calculateReadTime = (content) => {
    if (!content?.trim()) return 1;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const generateExcerpt = (content) => {
    return content?.length > 150 ? content.substring(0, 150) + '...' : content || '';
  };

  // Get platform icon and color for video URLs
  const getVideoPlatformInfo = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { icon: faYoutube, color: 'text-red-600', platform: 'YouTube' };
    } else if (url.includes('tiktok.com')) {
      return { icon: faTiktok, color: 'text-black', platform: 'TikTok' };
    } else if (url.includes('instagram.com')) {
      return { icon: faInstagram, color: 'text-pink-600', platform: 'Instagram' };
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return { icon: faFacebookF, color: 'text-blue-600', platform: 'Facebook' };
    } else if (url.includes('vimeo.com')) {
      return { icon: faVideo, color: 'text-blue-400', platform: 'Vimeo' };
    } else if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|3gp)$/i)) {
      return { icon: faVideo, color: 'text-green-600', platform: 'Video File' };
    }
    return { icon: faLink, color: 'text-gray-600', platform: 'External Link' };
  };

  // Blog operations
  const quickAddBlog = (status = 'published') => {
    if (!newBlog.content.trim()) {
      addAlert('error', 'Please add some content to your blog post');
      return;
    }
    
    const blogData = {
      id: Date.now() + Math.random(), // Ensure unique ID
      title: newBlog.title || `Blog Post ${blogs.length + 1}`,
      content: newBlog.content,
      excerpt: newBlog.excerpt || generateExcerpt(newBlog.content),
      category: newBlog.category || categories[0]?.name || 'General',
      date: new Date().toISOString().split('T')[0],
      publishDate: status === 'published' ? new Date().toISOString() : null,
      status: status,
      videoUrl: newBlog.videoUrl || '',
      imageUrl: newBlog.imageUrl,
      tags: newBlog.tags,
      author: newBlog.author,
      readTime: newBlog.readTime || '1',
      featured: newBlog.featured,
      metaDescription: newBlog.metaDescription || generateExcerpt(newBlog.content)
    };

    setBlogs([blogData, ...blogs]);
    setNewBlog({ 
      title: '', content: '', excerpt: '', category: '', subcategory: '',
      videoUrl: '', imageUrl: '', videoFile: null, tags: [], author: 'Admin',
      readTime: '1', featured: false, metaDescription: ''
    });
    setPreviewUrl('');
    setShowPreview(false);
    
    addAlert('success', status === 'published' ? 'Blog published successfully!' : 'Blog saved as draft');
  };

  const updateBlog = () => {
    if (!editingBlog?.content.trim()) {
      addAlert('error', 'Please add some content to your blog post');
      return;
    }
    
    const updatedBlog = {
      ...editingBlog,
      readTime: calculateReadTime(editingBlog.content).toString(),
      excerpt: editingBlog.excerpt || generateExcerpt(editingBlog.content),
      metaDescription: editingBlog.metaDescription || generateExcerpt(editingBlog.content)
    };

    setBlogs(blogs.map(blog => blog.id === editingBlog.id ? updatedBlog : blog));
    setEditingBlog(null);
    addAlert('success', 'Blog updated successfully!');
  };

  const deleteBlog = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogs(blogs.filter(blog => blog.id !== id));
      addAlert('success', 'Blog deleted successfully!');
    }
  };

  const toggleFeatured = (id) => {
    setBlogs(blogs.map(blog => blog.id === id ? {...blog, featured: !blog.featured} : blog));
    addAlert('success', 'Featured status updated!');
  };

  const togglePublishStatus = (id) => {
    setBlogs(blogs.map(blog => blog.id === id ? {
      ...blog, 
      status: blog.status === 'published' ? 'draft' : 'published',
      publishDate: blog.status === 'draft' ? new Date().toISOString() : blog.publishDate
    } : blog));
    addAlert('success', 'Publish status updated!');
  };

  // Media preview using SmartVideoEmbed
  const renderMediaPreview = () => {
    if (isVideoProcessing || isFetchingVideo) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-black mr-3" />
            <span className="text-gray-700">
              {isFetchingVideo ? '🔍 Detecting platform and generating embed code...' : 'Uploading video...'}
            </span>
          </div>
        </div>
      );
    }

    if (previewUrl) {
      return (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Smart Video Preview</h4>
            <button
              onClick={() => {
                setNewBlog(prev => ({ ...prev, videoUrl: '', videoFile: null }));
                setPreviewUrl('');
                addAlert('info', 'Media removed');
              }}
              className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              Remove
            </button>
          </div>
          <SmartVideoEmbed url={previewUrl} />
        </div>
      );
    }
    
    if (newBlog.imageUrl) {
      return (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Image Preview</h4>
            <button
              onClick={() => {
                setNewBlog(prev => ({ ...prev, imageUrl: '' }));
                addAlert('info', 'Image removed');
              }}
              className="text-red-500 hover:text-red-700 transition-colors text-sm flex items-center"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              Remove
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img src={newBlog.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Formatting toolbar component
  const FormattingToolbar = ({ isEditMode = false }) => (
    <div className="flex flex-wrap gap-1 mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button onClick={() => insertFormatting('bold', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold">
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button onClick={() => insertFormatting('italic', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic">
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button onClick={() => insertFormatting('bold-italic', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors font-bold italic" title="Bold & Italic">
          B/I
        </button>
      </div>
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button onClick={() => insertFormatting('heading', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Heading">
          <FontAwesomeIcon icon={faHeading} />
        </button>
        <button onClick={() => insertFormatting('quote', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Quote">
          <FontAwesomeIcon icon={faQuoteLeft} />
        </button>
        <button onClick={() => insertFormatting('code', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Code">
          <FontAwesomeIcon icon={faCode} />
        </button>
      </div>
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button onClick={() => insertFormatting('ul', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bullet List">
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button onClick={() => insertFormatting('ol', isEditMode)} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Numbered List">
          <FontAwesomeIcon icon={faListOl} />
        </button>
      </div>
      <div className="flex gap-1">
        <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Add Image">
          <FontAwesomeIcon icon={faImage} />
        </button>
        <button onClick={() => videoInputRef.current?.click()} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Upload Video">
          <FontAwesomeIcon icon={faVideo} />
        </button>
        <button onClick={handleVideoUrlInput} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Add Video URL">
          <FontAwesomeIcon icon={faLink} />
        </button>
      </div>
    </div>
  );

  // Enhanced Blog Card Component with Video Support
  const BlogCard = ({ blog }) => {
    const videoPlatformInfo = blog.videoUrl ? getVideoPlatformInfo(blog.videoUrl) : null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="relative">
          {/* Video Thumbnail/Preview */}
          {blog.videoUrl && (
            <div className="h-40 bg-gradient-to-br from-gray-900 to-black overflow-hidden relative group cursor-pointer"
                 onClick={() => {
                   setPreviewModalUrl(blog.videoUrl);
                   setShowPreviewModal(true);
                 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faPlay} className="text-white text-xl" />
                </div>
              </div>
              
              {/* Platform badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                  <FontAwesomeIcon icon={faVideo} className="mr-1" />
                  Video
                </div>
                {videoPlatformInfo && (
                  <div className={`${videoPlatformInfo.color.replace('text-', 'bg-')} bg-opacity-20 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center`}>
                    <FontAwesomeIcon icon={videoPlatformInfo.icon} className="mr-1" />
                    {videoPlatformInfo.platform}
                  </div>
                )}
              </div>
              
              {/* Video duration overlay */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                Click to preview
              </div>
            </div>
          )}
          
          {/* Image Thumbnail (only if no video) */}
          {!blog.videoUrl && blog.imageUrl && (
            <div className="h-40 bg-gray-200 overflow-hidden">
              <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* No media placeholder */}
          {!blog.videoUrl && !blog.imageUrl && (
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl" />
            </div>
          )}

          {blog.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {blog.status}
            </span>
            <div className="flex items-center space-x-2">
              {blog.videoUrl && (
                <span className="flex items-center text-blue-600 text-xs">
                  <FontAwesomeIcon icon={faVideo} className="mr-1" />
                  Video
                </span>
              )}
              <span className="text-xs text-gray-500">{blog.readTime || '1'} min read</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight text-base">
            {blog.title}
          </h3>
          
          <div className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
            {blog.excerpt ? (
              <MarkdownRenderer content={blog.excerpt} />
            ) : (
              <p>{blog.content?.substring(0, 100)}...</p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                {blog.date}
              </span>
              <span className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                {blog.author || 'Admin'}
              </span>
            </div>
          </div>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {blog.tags.slice(0, 2).map(tag => (
                <span key={`${blog.id}-${tag}`} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
              {blog.tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                  +{blog.tags.length - 2} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex space-x-1">
              <button onClick={() => setEditingBlog({...blog})} className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-50 transition-colors" title="Edit">
                <FontAwesomeIcon icon={faEdit} size="sm" />
              </button>
              <button onClick={() => toggleFeatured(blog.id)} className={`p-1 rounded-lg transition-colors ${
                blog.featured ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`} title={blog.featured ? 'Remove featured' : 'Make featured'}>
                <FontAwesomeIcon icon={faPalette} size="sm" />
              </button>
              <button onClick={() => togglePublishStatus(blog.id)} className="text-gray-400 hover:text-green-600 p-1 rounded-lg hover:bg-green-50 transition-colors" title={blog.status === 'published' ? 'Unpublish' : 'Publish'}>
                <FontAwesomeIcon icon={blog.status === 'published' ? faEyeSlash : faEye} size="sm" />
              </button>
              <button onClick={() => deleteBlog(blog.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
            
            {/* Quick video preview button */}
            {blog.videoUrl && (
              <button 
                onClick={() => {
                  setPreviewModalUrl(blog.videoUrl);
                  setShowPreviewModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors text-xs flex items-center"
                title="Preview Video"
              >
                <FontAwesomeIcon icon={faPlay} className="mr-1" />
                Preview
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Search and Filter Component
  const EnhancedSearchFilter = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value='published'>Published</option>
          <option value='draft'>Draft</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value)}
        >
          <option value="all">All Content</option>
          <option value="video">Video Posts</option>
          <option value="image">Image Posts</option>
          <option value="text-only">Text Only</option>
        </select>
        <div className="text-sm text-gray-600 flex items-center justify-center sm:justify-start">
          <FontAwesomeIcon icon={faGlobe} className="mr-2" />
          {filteredBlogs.length} of {blogs.length} posts
          {contentTypeFilter !== 'all' && (
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {contentTypeFilter === 'video' && 'Video Only'}
              {contentTypeFilter === 'image' && 'Image Only'}
              {contentTypeFilter === 'text-only' && 'Text Only'}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Edit Modal
  const renderEditSection = () => {
    if (!editingBlog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Edit Blog Post</h3>
              <button onClick={() => setEditingBlog(null)} className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <input
              type="text"
              placeholder="Blog post title..."
              className="w-full px-4 py-3 text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
              value={editingBlog.title}
              onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
            />
            
            <FormattingToolbar isEditMode={true} />
            
            <textarea
              ref={editContentTextareaRef}
              placeholder="Blog content..."
              rows="8"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none text-base leading-relaxed"
              value={editingBlog.content}
              onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Featured image URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                value={editingBlog.imageUrl}
                onChange={(e) => setEditingBlog({...editingBlog, imageUrl: e.target.value})}
              />
              <input
                type="text"
                placeholder="Video URL (YouTube, TikTok, Instagram, Facebook, etc.)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                value={editingBlog.videoUrl}
                onChange={(e) => setEditingBlog({...editingBlog, videoUrl: e.target.value})}
                onPaste={handlePaste}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                value={editingBlog.category}
                onChange={(e) => setEditingBlog({...editingBlog, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tags..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && e.target.value.trim() && setEditingBlog({
                      ...editingBlog, 
                      tags: [...(editingBlog.tags || []), e.target.value.trim()]
                    })}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingBlog.tags?.map((tag, index) => (
                    <span key={`${tag}-${index}`} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center">
                      {tag}
                      <button onClick={() => {
                        const newTags = editingBlog.tags.filter((_, i) => i !== index);
                        setEditingBlog({...editingBlog, tags: newTags});
                      }} className="ml-2 hover:text-gray-600 transition-colors">
                        <FontAwesomeIcon icon={faTimes} size="xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBlog.featured || false}
                  onChange={(e) => setEditingBlog({...editingBlog, featured: e.target.checked})}
                  className="w-4 h-4 text-black rounded focus:ring-black mr-2"
                />
                Featured Post
              </label>
            </div>

            {/* Preview section in edit modal */}
            <div className="mt-4">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center text-gray-600 hover:text-black transition-colors text-sm mb-2"
              >
                <FontAwesomeIcon icon={showPreview ? faEyeSlash : faEye} className="mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              
              {showPreview && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Smart Preview</h4>
                  <div className="bg-white rounded-lg border border-gray-300 p-4">
                    {editingBlog.imageUrl && (
                      <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-3">
                        <img src={editingBlog.imageUrl} alt={editingBlog.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{editingBlog.title || "Your Blog Title"}</h2>
                    {editingBlog.videoUrl && (
                      <div className="mb-3">
                        <SmartVideoEmbed url={editingBlog.videoUrl} />
                      </div>
                    )}
                    <div className="text-gray-700">
                      {editingBlog.content ? (
                        <MarkdownRenderer content={editingBlog.content} />
                      ) : (
                        <p className="text-gray-500 italic">Your content will appear here...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button onClick={() => setEditingBlog(null)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={updateBlog} className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Update Post
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Alerts */}
      {alerts.map(alert => (
        <CustomAlert key={alert.id} type={alert.type} message={alert.message} onClose={() => removeAlert(alert.id)} />
      ))}

      {/* Video Preview Modal */}
      {showPreviewModal && (
        <VideoPreviewModal 
          url={previewModalUrl} 
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewModalUrl('');
          }} 
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`flex-shrink-0 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'create' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('create')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Write New Post
        </button>
        <button
          className={`flex-shrink-0 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'manage' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('manage')}
        >
          <FontAwesomeIcon icon={faEdit} className="mr-2" />
          Manage Posts ({blogs.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <input
                type="text"
                placeholder="Amazing blog post title..."
                className="w-full px-4 py-3 text-xl font-bold border-0 focus:ring-0 placeholder-gray-400 bg-transparent"
                value={newBlog.title}
                onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                onPaste={handlePaste}
              />

              <FormattingToolbar />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-black h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <textarea
                ref={contentTextareaRef}
                placeholder="Start writing your amazing blog post... (Use **bold**, *italic*, # heading, - lists)"
                rows="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none font-sans text-base leading-relaxed transition-colors"
                value={newBlog.content}
                onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                onPaste={handlePaste}
              />
              
              {renderMediaPreview()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    placeholder="Short description..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    placeholder="SEO description..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    value={newBlog.metaDescription}
                    onChange={(e) => setNewBlog({...newBlog, metaDescription: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({...newBlog, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tags..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button onClick={addTag} className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newBlog.tags.map(tag => (
                      <span key={`${tag}-${Date.now()}`} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-gray-600 transition-colors">
                          <FontAwesomeIcon icon={faTimes} size="xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-gray-600 hover:text-black cursor-pointer transition-colors text-sm">
                    <input
                      type="checkbox"
                      checked={newBlog.featured}
                      onChange={(e) => setNewBlog({...newBlog, featured: e.target.checked})}
                      className="mr-2 rounded focus:ring-black"
                    />
                    Featured Post
                  </label>
                  <button onClick={() => setShowPreview(!showPreview)} className="flex items-center text-gray-600 hover:text-black transition-colors text-sm">
                    <FontAwesomeIcon icon={showPreview ? faEyeSlash : faEye} className="mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
                
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button onClick={() => quickAddBlog('draft')} disabled={!newBlog.content.trim()} className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    Save Draft
                  </button>
                  <button onClick={() => quickAddBlog('published')} disabled={!newBlog.content.trim()} className="flex-1 sm:flex-none px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                    Publish Now
                  </button>
                </div>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Smart Live Preview</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Auto-Embed Active</span>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {newBlog.imageUrl && (
                    <div className="w-full h-48 bg-gray-200 overflow-hidden">
                      <img src={newBlog.imageUrl} alt={newBlog.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                      <span>{newBlog.author}</span>
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>{newBlog.readTime} min read</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-3">{newBlog.title || "Your Blog Title"}</h1>
                    {newBlog.videoUrl && (
                      <div className="mb-4">
                        <SmartVideoEmbed url={newBlog.videoUrl} />
                      </div>
                    )}
                    <div className="text-gray-700">
                      {newBlog.content ? (
                        <MarkdownRenderer content={newBlog.content} />
                      ) : (
                        <p className="text-gray-500 italic">Your content will appear here...</p>
                      )}
                    </div>
                    {newBlog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {newBlog.tags.map(tag => (
                          <span key={`${tag}-${Date.now()}`} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Enhanced Search and Filter */}
          <EnhancedSearchFilter />

          {/* Blog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <BlogCard key={`${blog.id}-${blog.title}`} blog={blog} />
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {contentTypeFilter === 'video' ? (
                <>
                  <FontAwesomeIcon icon={faVideo} className="text-4xl text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No video posts found</h4>
                  <p className="text-gray-500">Create a new post with video content to see it here.</p>
                </>
              ) : contentTypeFilter === 'image' ? (
                <>
                  <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No image posts found</h4>
                  <p className="text-gray-500">Create a new post with image content to see it here.</p>
                </>
              ) : contentTypeFilter === 'text-only' ? (
                <>
                  <FontAwesomeIcon icon={faFile} className="text-4xl text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No text-only posts found</h4>
                  <p className="text-gray-500">Create a new post without media to see it here.</p>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} className="text-4xl text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No posts found</h4>
                  <p className="text-gray-500">Try adjusting your search or create a new post.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {renderEditSection()}
    </div>
  );
};

export default BlogsTab;