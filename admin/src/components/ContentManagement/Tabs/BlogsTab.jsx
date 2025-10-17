import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faEdit, 
  faTrash, 
  faPlus, 
  faVideo, 
  faImage, 
  faLink,
  faTimes,
  faEye,
  faPaperPlane,
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faQuoteLeft,
  faCode,
  faHeading,
  faPalette,
  faSearch,
  faCalendar,
  faUser,
  faTags,
  faPlay,
  faUpload,
  faEyeSlash,
  faGlobe,
  faShare,
  faBookmark,
  faClock,
  faHeart,
  faComment,
  faChartBar,
  faUnderline,
  faStrikethrough
} from '@fortawesome/free-solid-svg-icons';

const BlogsTab = ({ blogs, setBlogs, categories }) => {
  const [newBlog, setNewBlog] = useState({ 
    title: '', 
    content: '', 
    excerpt: '',
    category: '', 
    subcategory: '',
    videoUrl: '',
    imageUrl: '',
    videoFile: null,
    tags: [],
    author: 'Admin',
    readTime: '1',
    featured: false,
    metaDescription: ''
  });
  const [editingBlog, setEditingBlog] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [previewUrl, setPreviewUrl] = useState('');
  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeBlog, setActiveBlog] = useState(null);
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Calculate read time whenever content changes
  useEffect(() => {
    const readTime = calculateReadTime(newBlog.content);
    setNewBlog(prev => ({ ...prev, readTime: readTime.toString() }));
  }, [newBlog.content]);

  // Filter blogs based on search and status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Simple category selection
  const getSubcategories = (categoryName) => {
    if (!categoryName) return [];
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.subcategories : [];
  };

  // Enhanced URL detection and formatting
  const detectAndFormatUrl = (url) => {
    if (!url) return '';
    
    // YouTube - Multiple formats
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtube.com/embed/')) {
      return url; // Already in embed format
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const parts = url.split('vimeo.com/');
      if (parts[1]) {
        const videoId = parts[1].split('/').pop();
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
      }
    }
    if (url.includes('player.vimeo.com/video/')) {
      return url; // Already in embed format
    }
    
    // Direct video files
    if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return url;
    }
    
    return url;
  };

  // Test if URL is playable video
  const isPlayableVideo = (url) => {
    if (!url) return false;
    return url.includes('youtube.com/embed') || 
           url.includes('youtu.be') ||
           url.includes('vimeo.com') ||
           url.includes('player.vimeo.com') ||
           url.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
           url.startsWith('blob:');
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      simulateUploadProgress(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewBlog({...newBlog, imageUrl: e.target.result });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file too large. Please select a file smaller than 100MB');
        return;
      }

      setIsVideoProcessing(true);
      simulateUploadProgress(() => {
        const videoUrl = URL.createObjectURL(file);
        setNewBlog({
          ...newBlog,
          videoFile: file,
          videoUrl: videoUrl
        });
        setPreviewUrl(videoUrl);
        setIsVideoProcessing(false);
      });
    }
  };

  // Handle video URL input
  const handleVideoUrlInput = () => {
    const url = prompt('Enter video URL (YouTube, Vimeo, or direct video link):');
    if (url) {
      setIsVideoProcessing(true);
      const formattedUrl = detectAndFormatUrl(url);
      setNewBlog({...newBlog, videoUrl: formattedUrl });
      setPreviewUrl(formattedUrl);
      
      // Test if the URL is playable
      setTimeout(() => {
        setIsVideoProcessing(false);
        if (!isPlayableVideo(formattedUrl)) {
          alert('This URL may not be playable. Please check if it\'s a valid video URL.');
        }
      }, 1000);
    }
  };

  // Simulate upload progress
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

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !newBlog.tags.includes(newTag.trim())) {
      setNewBlog({
        ...newBlog,
        tags: [...newBlog.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setNewBlog({
      ...newBlog,
      tags: newBlog.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Enhanced formatting tools with combined bold+italic support
  const insertFormatting = (format) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newBlog.content.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'bold-italic':
        formattedText = `***${selectedText}***`;
        cursorOffset = 3;
        break;
      case 'heading':
        formattedText = `# ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      case 'ul':
        formattedText = `- ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'ol':
        const currentLineStart = newBlog.content.lastIndexOf('\n', start) + 1;
        const currentLineEnd = newBlog.content.indexOf('\n', start);
        const currentLine = newBlog.content.substring(
          currentLineStart, 
          currentLineEnd === -1 ? newBlog.content.length : currentLineEnd
        );
        
        const olMatch = currentLine.match(/^(\d+)\.\s/);
        if (olMatch) {
          const currentNumber = parseInt(olMatch[1]);
          formattedText = `${currentNumber + 1}. ${selectedText}`;
        } else {
          formattedText = `1. ${selectedText}`;
        }
        cursorOffset = 4;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = newBlog.content.substring(0, start) + formattedText + newBlog.content.substring(end);
    setNewBlog({...newBlog, content: newContent});
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + (selectedText ? cursorOffset + selectedText.length : formattedText.length);
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!content || !content.trim()) return 1;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  // Generate excerpt from content
  const generateExcerpt = (content) => {
    if (!content) return '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  // Quick add blog with minimal input
  const quickAddBlog = (status = 'published') => {
    if (newBlog.content.trim() === '') {
      alert('Please add some content to your blog post');
      return;
    }
    
    const blogData = {
      id: Date.now(),
      title: newBlog.title || `Blog Post ${blogs.length + 1}`,
      content: newBlog.content,
      excerpt: newBlog.excerpt || generateExcerpt(newBlog.content),
      category: newBlog.category || categories[0]?.name || 'General',
      subcategory: newBlog.subcategory || '',
      date: new Date().toISOString().split('T')[0],
      publishDate: status === 'published' ? new Date().toISOString() : null,
      time: new Date().toLocaleTimeString(),
      status: status,
      comments: 0,
      videoUrl: newBlog.videoUrl || '',
      imageUrl: newBlog.imageUrl,
      videoFile: newBlog.videoFile,
      likes: 0,
      shares: 0,
      tags: newBlog.tags,
      author: newBlog.author,
      readTime: newBlog.readTime || '1',
      featured: newBlog.featured,
      views: 0,
      metaDescription: newBlog.metaDescription || generateExcerpt(newBlog.content)
    };

    setBlogs([blogData, ...blogs]);
    setNewBlog({ 
      title: '', 
      content: '', 
      excerpt: '',
      category: '', 
      subcategory: '',
      videoUrl: '',
      imageUrl: '',
      videoFile: null,
      tags: [],
      author: 'Admin',
      readTime: '1',
      featured: false,
      metaDescription: ''
    });
    setPreviewUrl('');
    setShowPreview(false);
    
    toast.success(status === 'published' ? 'Blog post published successfully!' : 'Blog post saved as draft');
  };

  // Update blog
  const updateBlog = () => {
    if (!editingBlog || editingBlog.content.trim() === '') return;
    
    const updatedBlog = {
      ...editingBlog,
      videoUrl: editingBlog.videoUrl ? detectAndFormatUrl(editingBlog.videoUrl) : '',
      readTime: calculateReadTime(editingBlog.content).toString(),
      excerpt: editingBlog.excerpt || generateExcerpt(editingBlog.content)
    };

    setBlogs(blogs.map(blog => 
      blog.id === editingBlog.id ? updatedBlog : blog
    ));
    
    setEditingBlog(null);
    toast.success('Blog post updated successfully!');
  };

  // Delete blog
  const deleteBlog = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogs(blogs.filter(blog => blog.id !== id));
      if (activeBlog?.id === id) {
        setActiveBlog(null);
      }
      toast.success('Blog post deleted successfully!');
    }
  };

  // Toggle featured status
  const toggleFeatured = (id) => {
    setBlogs(blogs.map(blog => 
      blog.id === id ? {...blog, featured: !blog.featured} : blog
    ));
    toast.success('Featured status updated!');
  };

  // Toggle publish status
  const togglePublishStatus = (id) => {
    setBlogs(blogs.map(blog => 
      blog.id === id ? {
        ...blog, 
        status: blog.status === 'published' ? 'draft' : 'published',
        publishDate: blog.status === 'draft' ? new Date().toISOString() : blog.publishDate
      } : blog
    ));
    toast.success('Publish status updated!');
  };

  // Like blog
  const likeBlog = (id) => {
    setBlogs(blogs.map(blog => 
      blog.id === id ? {...blog, likes: (blog.likes || 0) + 1} : blog
    ));
  };

  // Render media preview in editor
  const renderMediaPreview = () => {
    if (isVideoProcessing) {
      return (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">Processing video...</span>
          </div>
        </div>
      );
    }

    if (previewUrl && isPlayableVideo(previewUrl)) {
      if (previewUrl.includes('youtube.com/embed') || previewUrl.includes('youtu.be')) {
        return (
          <div className="mt-3 relative">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-48"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">YouTube Video Preview</p>
          </div>
        );
      } else if (previewUrl.includes('vimeo.com')) {
        return (
          <div className="mt-3 relative">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-48"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Vimeo Video Preview</p>
          </div>
        );
      } else if (previewUrl.startsWith('blob:') || newBlog.videoFile || previewUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
        return (
          <div className="mt-3 relative">
            <video
              src={previewUrl}
              controls
              className="w-full h-48 rounded-lg bg-black"
              poster={newBlog.imageUrl} // Use featured image as poster
            >
              Your browser does not support the video tag.
            </video>
            <p className="text-xs text-gray-500 mt-2">Video File Preview</p>
          </div>
        );
      }
    }
    
    if (previewUrl) {
      return (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> This URL may not be playable as a video.
          </p>
          <p className="text-xs text-yellow-600 mt-1">Link: {previewUrl}</p>
        </div>
      );
    }
    
    if (newBlog.imageUrl) {
      return (
        <div className="mt-3">
          <img 
            src={newBlog.imageUrl} 
            alt="Preview" 
            className="max-w-full h-48 object-cover rounded-lg border"
          />
          <p className="text-xs text-gray-500 mt-2">Featured Image Preview</p>
        </div>
      );
    }
    
    return null;
  };

  // Enhanced blog content renderer with better markdown support
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let currentList = [];
    let listType = '';

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc ml-6 mb-4 space-y-2">
              {currentList.map((item, idx) => (
                <li key={idx} className="text-gray-700 leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        } else if (listType === 'ol') {
          elements.push(
            <ol key={`list-${elements.length}`} className="list-decimal ml-6 mb-4 space-y-2">
              {currentList.map((item, idx) => (
                <li key={idx} className="text-gray-700 leading-relaxed">{item}</li>
              ))}
            </ol>
          );
        }
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      // Headings
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={index} className="text-3xl font-bold text-gray-900 mt-8 mb-4 leading-tight">{line.substring(2)}</h1>);
      } 
      else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-2xl font-bold text-gray-800 mt-6 mb-3 leading-tight">{line.substring(3)}</h2>);
      }
      else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-xl font-semibold text-gray-800 mt-5 mb-2 leading-tight">{line.substring(4)}</h3>);
      }
      // Quotes
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2 rounded-r">
            {line.substring(2)}
          </blockquote>
        );
      }
      // Lists
      else if (line.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(line.substring(2));
      }
      else if (line.match(/^\d+\. /)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        const itemText = line.replace(/^\d+\. /, '');
        currentList.push(itemText);
      }
      // Code
      else if (line.includes('`')) {
        flushList();
        const parts = line.split('`');
        elements.push(
          <p key={index} className="mb-4">
            {parts.map((part, i) => 
              i % 2 === 0 ? part : <code key={i} className="bg-gray-800 text-gray-100 px-2 py-1 rounded text-sm font-mono border">{part}</code>
            )}
          </p>
        );
      }
      // Bold and Italic with combined support
      else if (line.includes('**') || line.includes('*')) {
        flushList();
        let processedLine = line;
        // Handle bold and italic combined (***text***)
        processedLine = processedLine.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>');
        // Handle bold (**text**)
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
        // Handle italic (*text*)
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        elements.push(<p key={index} className="mb-4 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />);
      }
      // Regular paragraph
      else if (line.trim()) {
        flushList();
        elements.push(<p key={index} className="mb-4 text-gray-700 leading-relaxed">{line}</p>);
      }
      // Empty line
      else {
        flushList();
        if (elements.length > 0) {
          elements.push(<div key={index} className="h-4"></div>);
        }
      }
    });

    // Flush any remaining list items
    flushList();

    return elements;
  };

  // Render blog post preview
  const renderBlogPreview = () => {
    const previewData = {
      ...newBlog,
      id: 'preview',
      date: new Date().toLocaleDateString(),
      readTime: newBlog.readTime || '1',
      comments: 0,
      likes: 0,
      views: 0,
      author: newBlog.author || 'Admin'
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Featured Image */}
        {previewData.imageUrl && (
          <div className="w-full h-48 sm:h-64 bg-gray-200 overflow-hidden">
            <img 
              src={previewData.imageUrl} 
              alt={previewData.title || "Blog post"} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-1 sm:mr-2" />
                {previewData.author}
              </span>
              <span className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="mr-1 sm:mr-2" />
                {previewData.date}
              </span>
              <span className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-1 sm:mr-2" />
                {previewData.readTime} min read
              </span>
            </div>
            {previewData.featured && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {previewData.title || "Your Blog Post Title"}
          </h1>

          {/* Video Content */}
          {previewData.videoUrl && isPlayableVideo(previewData.videoUrl) && (
            <div className="mb-6">
              {previewData.videoUrl.includes('youtube.com/embed') || previewData.videoUrl.includes('youtu.be') ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={previewData.videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title="Blog video"
                  />
                </div>
              ) : previewData.videoUrl.includes('vimeo.com') ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={previewData.videoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title="Blog video"
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={previewData.videoUrl}
                    controls
                    className="w-full h-full"
                    poster={previewData.imageUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          )}

          {/* Content with proper formatting */}
          <div className="prose prose-sm sm:prose-lg max-w-none mb-6">
            {previewData.content ? (
              <div className="text-gray-700 leading-relaxed">
                {renderFormattedContent(previewData.content)}
              </div>
            ) : (
              <p className="text-gray-500 italic">Your blog content will appear here...</p>
            )}
          </div>

          {/* Tags */}
          {previewData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {previewData.tags.map(tag => (
                <span key={tag} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200 gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6 text-gray-600 text-sm">
              <button className="flex items-center space-x-1 sm:space-x-2 hover:text-blue-600 transition-colors">
                <FontAwesomeIcon icon={faHeart} />
                <span>Like ({previewData.likes})</span>
              </button>
              <button className="flex items-center space-x-1 sm:space-x-2 hover:text-green-600 transition-colors">
                <FontAwesomeIcon icon={faShare} />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 sm:space-x-2 hover:text-purple-600 transition-colors">
                <FontAwesomeIcon icon={faBookmark} />
                <span>Save</span>
              </button>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              <span className="mr-3 sm:mr-4">{previewData.views} views</span>
              <span>{previewData.comments} comments</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render individual blog post card
  const renderBlogCard = (blog) => {
    return (
      <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
        {/* Featured Image with Video Indicator */}
        <div className="relative">
          {blog.imageUrl && (
            <div className="h-40 sm:h-48 bg-gray-200 overflow-hidden">
              <img 
                src={blog.imageUrl} 
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          {(blog.videoUrl || blog.videoFile) && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-1 sm:p-2 rounded-full">
              <FontAwesomeIcon icon={faPlay} className="text-xs sm:text-sm" />
            </div>
          )}
          {blog.featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              blog.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {blog.status}
            </span>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
              <FontAwesomeIcon icon={faChartBar} className="hidden sm:block" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight text-sm sm:text-base">
            {blog.title}
          </h3>
          
          <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
            {blog.excerpt}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                {blog.date}
              </span>
              <span className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                {blog.readTime || '1'} min
              </span>
            </div>
            <span className="flex items-center">
              <FontAwesomeIcon icon={faHeart} className="mr-1 text-red-500" />
              {blog.likes || 0}
            </span>
          </div>
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {blog.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
              {blog.tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{blog.tags.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex space-x-1">
              <button 
                className="text-gray-400 hover:text-blue-600 p-1 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setEditingBlog({...blog})}
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} size="sm" />
              </button>
              <button 
                className={`p-1 sm:p-2 rounded-lg transition-colors ${
                  blog.featured 
                    ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50' 
                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
                onClick={() => toggleFeatured(blog.id)}
                title={blog.featured ? 'Remove featured' : 'Make featured'}
              >
                <FontAwesomeIcon icon={faPalette} size="sm" />
              </button>
              <button 
                className="text-gray-400 hover:text-green-600 p-1 sm:p-2 rounded-lg hover:bg-green-50 transition-colors"
                onClick={() => togglePublishStatus(blog.id)}
                title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
              >
                <FontAwesomeIcon icon={blog.status === 'published' ? faEyeSlash : faEye} size="sm" />
              </button>
              <button 
                className="text-gray-400 hover:text-red-600 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => deleteBlog(blog.id)}
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faComment} className="mr-1" />
              {blog.comments || 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simple toast notification
  const toast = {
    success: (message) => {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg z-50 text-sm sm:text-base';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <button
          className={`flex-shrink-0 px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'create' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('create')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Write New Post
        </button>
        <button
          className={`flex-shrink-0 px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'manage' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('manage')}
        >
          <FontAwesomeIcon icon={faEdit} className="mr-2" />
          Manage Posts ({blogs.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Editor Column */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Blog Title */}
              <input
                type="text"
                placeholder="Amazing blog post title..."
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-xl sm:text-2xl font-bold border-0 focus:ring-0 placeholder-gray-400 bg-transparent"
                value={newBlog.title}
                onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
              />

              {/* Enhanced Formatting Toolbar */}
              <div className="flex flex-wrap gap-1 mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <button 
                    onClick={() => insertFormatting('bold')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Bold"
                  >
                    <FontAwesomeIcon icon={faBold} />
                  </button>
                  <button 
                    onClick={() => insertFormatting('italic')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Italic"
                  >
                    <FontAwesomeIcon icon={faItalic} />
                  </button>
                  <button 
                    onClick={() => insertFormatting('bold-italic')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors font-bold italic" 
                    title="Bold & Italic"
                  >
                    B/I
                  </button>
                </div>

                {/* Structure */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <button 
                    onClick={() => insertFormatting('heading')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Heading"
                  >
                    <FontAwesomeIcon icon={faHeading} />
                  </button>
                  <button 
                    onClick={() => insertFormatting('quote')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Quote"
                  >
                    <FontAwesomeIcon icon={faQuoteLeft} />
                  </button>
                  <button 
                    onClick={() => insertFormatting('code')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Code"
                  >
                    <FontAwesomeIcon icon={faCode} />
                  </button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <button 
                    onClick={() => insertFormatting('ul')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Bullet List"
                  >
                    <FontAwesomeIcon icon={faListUl} />
                  </button>
                  <button 
                    onClick={() => insertFormatting('ol')} 
                    className="p-2 hover:bg-gray-200 rounded transition-colors" 
                    title="Numbered List"
                  >
                    <FontAwesomeIcon icon={faListOl} />
                  </button>
                </div>
                
                {/* Media Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                    title="Add Image"
                  >
                    <FontAwesomeIcon icon={faImage} />
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                    title="Upload Video"
                  >
                    <FontAwesomeIcon icon={faVideo} />
                  </button>
                  <button
                    onClick={handleVideoUrlInput}
                    className="p-2 hover:bg-green-100 rounded text-green-600 transition-colors"
                    title="Add Video URL"
                  >
                    <FontAwesomeIcon icon={faLink} />
                  </button>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Blog Content */}
              <textarea
                ref={contentTextareaRef}
                placeholder="Start writing your amazing blog post... (Supports markdown: **bold**, *italic*, # heading, - lists)"
                rows="12"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none font-sans text-base sm:text-lg leading-relaxed transition-colors"
                value={newBlog.content}
                onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
              />
              
              {/* Media Preview */}
              {renderMediaPreview()}

              {/* Blog Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    placeholder="Short description for SEO and previews"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    placeholder="SEO meta description"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    value={newBlog.metaDescription}
                    onChange={(e) => setNewBlog({...newBlog, metaDescription: e.target.value})}
                  />
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({...newBlog, category: e.target.value, subcategory: ''})}
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
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newBlog.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center transition-colors">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-600 transition-colors">
                          <FontAwesomeIcon icon={faTimes} size="xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-gray-600 hover:text-green-600 cursor-pointer transition-colors text-sm">
                    <input
                      type="checkbox"
                      checked={newBlog.featured}
                      onChange={(e) => setNewBlog({...newBlog, featured: e.target.checked})}
                      className="mr-2 rounded focus:ring-black"
                    />
                    Featured Post
                  </label>
                  
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors text-sm"
                  >
                    <FontAwesomeIcon icon={showPreview ? faEyeSlash : faEye} className="mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
                
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    onClick={() => quickAddBlog('draft')}
                    disabled={!newBlog.content.trim()}
                  >
                    Save Draft
                  </button>
                  <button
                    className="flex-1 sm:flex-none px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    onClick={() => quickAddBlog('published')}
                    disabled={!newBlog.content.trim()}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                    Publish Now
                  </button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleVideoUpload}
              />
            </div>
          </div>

          {/* Preview Column */}
          {showPreview && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Live Preview</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  This is how your blog post will appear on your website
                </p>
                {renderBlogPreview()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
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
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              
              <select
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    setSearchTerm(e.target.value);
                  }
                }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center sm:justify-start">
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                {filteredBlogs.length} of {blogs.length} posts
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredBlogs.map(blog => renderBlogCard(blog))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-gray-400 mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-3xl sm:text-4xl" />
              </div>
              <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">No posts found</h4>
              <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or create a new post.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Blog Post</h3>
                <button
                  onClick={() => setEditingBlog(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <input
                type="text"
                placeholder="Blog post title..."
                className="w-full px-3 sm:px-4 py-3 text-lg sm:text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                value={editingBlog.title}
                onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
              />
              
              <textarea
                placeholder="Blog content..."
                rows="6"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none text-sm sm:text-base"
                value={editingBlog.content}
                onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Featured image URL"
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                  value={editingBlog.imageUrl}
                  onChange={(e) => setEditingBlog({...editingBlog, imageUrl: e.target.value})}
                />
                
                <input
                  type="text"
                  placeholder="Video URL"
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm"
                  value={editingBlog.videoUrl}
                  onChange={(e) => setEditingBlog({...editingBlog, videoUrl: e.target.value})}
                />
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setEditingBlog(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBlog}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Update Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsTab;