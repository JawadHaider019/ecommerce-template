import { Blog } from '../models/blogModel.js';
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

// 🟢 Blog Controllers

export const getAllBlogs = async (req, res) => {
  try {
    let { search = '', status = '', category = '', tags = '', contentType = '', page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (status) filter.status = status;
    if (category) filter.category = { $in: category.split(',').map(c => c.trim()) };
    if (tags) filter.tags = { $in: tags.split(',').map(t => t.trim()) };

    if (contentType === 'image') {
      filter.imageUrl = { $ne: '' };
      filter.videoUrl = '';
    } else if (contentType === 'video') {
      filter.videoUrl = { $ne: '' };
    } else if (contentType === 'text-only') {
      filter.imageUrl = '';
      filter.videoUrl = '';
    } else if (contentType === 'media') {
      filter.$or = [{ imageUrl: { $ne: '' } }, { videoUrl: { $ne: '' } }];
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(filter);
    res.json({ success: true, data: blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching blogs', error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    blog.views += 1;
    await blog.save();
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching blog', error: error.message });
  }
};

// ✅ Create blog with Cloudinary upload
export const createBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image'
      });
      if (req.file.mimetype.startsWith('image')) blogData.imageUrl = result.secure_url;
      else blogData.videoUrl = result.secure_url;

      fs.unlinkSync(req.file.path); // Remove local temp file
    }

    if (blogData.category && !Array.isArray(blogData.category)) blogData.category = [blogData.category];
    if (blogData.tags && !Array.isArray(blogData.tags)) blogData.tags = [blogData.tags];

    if (!blogData.title) {
      const blogCount = await Blog.countDocuments();
      blogData.title = `Blog Post ${blogCount + 1}`;
    }

    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating blog', error: error.message });
  }
};

// ✅ Update blog with Cloudinary upload
export const updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image'
      });
      if (req.file.mimetype.startsWith('image')) updateData.imageUrl = result.secure_url;
      else updateData.videoUrl = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    if (updateData.category && !Array.isArray(updateData.category)) updateData.category = [updateData.category];
    if (updateData.tags && !Array.isArray(updateData.tags)) updateData.tags = [updateData.tags];

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    res.json({ success: true, message: 'Blog updated successfully', data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating blog', error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting blog', error: error.message });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    blog.featured = !blog.featured;
    await blog.save();
    res.json({ success: true, message: `Blog ${blog.featured ? 'featured' : 'unfeatured'} successfully`, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating blog', error: error.message });
  }
};

export const togglePublishStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    blog.status = blog.status === 'published' ? 'draft' : 'published';
    if (blog.status === 'published' && !blog.publishDate) blog.publishDate = new Date();
    await blog.save();
    res.json({ success: true, message: `Blog ${blog.status === 'published' ? 'published' : 'unpublished'} successfully`, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating blog status', error: error.message });
  }
};

// 🟩 Simple Category Management (without separate model)
export const getAllCategories = async (req, res) => {
  try {
    // Get distinct categories from all blogs with counts
    const categories = await Blog.aggregate([
      { $unwind: "$category" },
      { 
        $group: {
          _id: "$category",
          blogCount: { $sum: 1 },
          lastUsed: { $max: "$updatedAt" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      blogCount: cat.blogCount,
      lastUsed: cat.lastUsed
    }));
    
    res.json({ success: true, data: formattedCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    
    // Check if category already exists in any blog
    const existingCategory = await Blog.findOne({ 
      category: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    res.json({ 
      success: true, 
      message: 'Category can be used', 
      data: { name: name.trim() } 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating category', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { newName } = req.body;
    const oldName = req.params.id;
    
    if (!newName || newName.trim() === '') {
      return res.status(400).json({ success: false, message: 'New category name is required' });
    }
    
    // Update all blogs that have this category
    const result = await Blog.updateMany(
      { category: oldName },
      { $set: { "category.$": newName.trim() } }
    );
    
    res.json({ 
      success: true, 
      message: `Category updated in ${result.modifiedCount} blog(s)`, 
      data: { oldName, newName: newName.trim() } 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryName = req.params.id;
    
    // Remove this category from all blogs
    const result = await Blog.updateMany(
      { category: categoryName },
      { $pull: { category: categoryName } }
    );
    
    res.json({ 
      success: true, 
      message: `Category removed from ${result.modifiedCount} blog(s)` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
  }
};