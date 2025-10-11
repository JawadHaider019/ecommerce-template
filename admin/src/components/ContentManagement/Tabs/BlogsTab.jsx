import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEdit, faTrash, faPlus, faVideo } from '@fortawesome/free-solid-svg-icons';

const BlogsTab = ({ blogs, setBlogs, categories }) => {
  const [newBlog, setNewBlog] = useState({ 
    title: '', 
    content: '', 
    category: '', 
    subcategory: '',
    videoUrl: '' 
  });
  const [editingBlog, setEditingBlog] = useState(null);

  const getSubcategories = (categoryName) => {
    if (!categoryName) return [];
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.subcategories : [];
  };

  const addBlog = () => {
    if (newBlog.title.trim() === '') return;
    const newPost = {
      id: Date.now(),
      title: newBlog.title,
      content: newBlog.content,
      category: newBlog.category || categories[0]?.name || '',
      subcategory: newBlog.subcategory || '',
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      comments: 0,
      videoUrl: newBlog.videoUrl
    };
    setBlogs([...blogs, newPost]);
    setNewBlog({ title: '', content: '', category: '', subcategory: '', videoUrl: '' });
  };

  const updateBlog = () => {
    if (!editingBlog || editingBlog.title.trim() === '') return;
    
    setBlogs(blogs.map(blog => 
      blog.id === editingBlog.id ? {...editingBlog} : blog
    ));
    
    setEditingBlog(null);
  };

  const publishBlog = (id) => {
    setBlogs(blogs.map(blog => 
      blog.id === id ? {...blog, status: 'published'} : blog
    ));
  };

  const deleteBlog = (id) => {
    setBlogs(blogs.filter(blog => blog.id !== id));
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">
          {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
        </h3>
        <div className="grid grid-cols-1 gap-3 mb-3">
          <input
            type="text"
            placeholder="Blog Title"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            value={editingBlog ? editingBlog.title : newBlog.title}
            onChange={(e) => editingBlog 
              ? setEditingBlog({...editingBlog, title: e.target.value})
              : setNewBlog({...newBlog, title: e.target.value})
            }
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              value={editingBlog ? editingBlog.category : newBlog.category}
              onChange={(e) => editingBlog 
                ? setEditingBlog({...editingBlog, category: e.target.value, subcategory: ''})
                : setNewBlog({...newBlog, category: e.target.value, subcategory: ''})
              }
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              value={editingBlog ? editingBlog.subcategory : newBlog.subcategory}
              onChange={(e) => editingBlog 
                ? setEditingBlog({...editingBlog, subcategory: e.target.value})
                : setNewBlog({...newBlog, subcategory: e.target.value})
              }
              disabled={editingBlog ? !editingBlog.category : !newBlog.category}
            >
              <option value="">Select Subcategory (optional)</option>
              {(editingBlog ? getSubcategories(editingBlog.category) : getSubcategories(newBlog.category))
                .map(subcategory => (
                  <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>
                ))
              }
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FontAwesomeIcon icon={faVideo} className="mr-2" />
              Video URL (YouTube, Vimeo, etc.)
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/embed/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              value={editingBlog ? editingBlog.videoUrl : newBlog.videoUrl}
              onChange={(e) => editingBlog 
                ? setEditingBlog({...editingBlog, videoUrl: e.target.value})
                : setNewBlog({...newBlog, videoUrl: e.target.value})
              }
            />
          </div>
          
          <textarea
            placeholder="Blog Content"
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            value={editingBlog ? editingBlog.content : newBlog.content}
            onChange={(e) => editingBlog 
              ? setEditingBlog({...editingBlog, content: e.target.value})
              : setNewBlog({...newBlog, content: e.target.value})
            }
          />
        </div>
        
        <div className="flex gap-2">
          {editingBlog ? (
            <>
              <button
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black flex items-center"
                onClick={updateBlog}
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Update Blog
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center"
                onClick={() => setEditingBlog(null)}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="px-4 py-2 bg-black text-white hover:bg-black flex items-center"
                onClick={addBlog}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Save as Draft
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 flex items-center"
                onClick={addBlog}
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Publish
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map(blog => (
              <tr key={blog.id}>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{blog.title}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{blog.category}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{blog.subcategory || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{blog.date}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {blog.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{blog.comments}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  {blog.status !== 'published' && (
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => publishBlog(blog.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                  <button 
                    className="text-black hover:text-blue-900 mr-3"
                    onClick={() => setEditingBlog({...blog})}
                    >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => deleteBlog(blog.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogsTab;