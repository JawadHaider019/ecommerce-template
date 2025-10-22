// controllers/businessDetailsController.js
import BusinessDetails from '../models/BusinessDetails.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';

// ========================
// PUBLIC CONTROLLERS
// ========================

export const getBusinessDetails = async (req, res) => {
  try {
    console.log('GET /api/business-details called');
    const businessDetails = await BusinessDetails.getBusinessDetails();
    
    console.log('Business details found:', {
      id: businessDetails._id,
      companyName: businessDetails.company.name
    });
    
    res.json({
      success: true,
      data: businessDetails
    });
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.json({
      success: false,
      message: 'Error fetching business details',
      error: error.message
    });
  }
};

export const getActiveStores = async (req, res) => {
  try {
    const businessDetails = await BusinessDetails.getBusinessDetails();
    const activeStores = businessDetails.multiStore.stores.filter(store => store.isActive);
    
    res.json({
      success: true,
      count: activeStores.length,
      data: activeStores
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Error fetching stores',
      error: error.message
    });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    const businessDetails = await BusinessDetails.getBusinessDetails();
    
    const store = businessDetails.multiStore.stores.find(
      s => s.storeId === storeId && s.isActive
    );
    
    if (!store) {
      return res.json({
        success: false,
        message: 'Store not found'
      });
    }
    
    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Error fetching store',
      error: error.message
    });
  }
};

// ========================
// COMPANY-LEVEL CONTROLLERS
// ========================
export const updateCompanyDetails = async (req, res) => {
  const uploadedFiles = [];

  try {
    console.log('=== UPDATE COMPANY DETAILS REQUEST ===');
    console.log('Headers:', {
      token: req.headers.token ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    });

    // Check authentication first
    if (!req.headers.token) {
      console.log('❌ No token provided in headers');
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      console.log('❌ Token verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    console.log('Found business details:', businessDetails._id);
    
    const { companyName, tagline, description, foundedYear, customerSupport, location, socialMedia, policies } = req.body;
    
    console.log('Received form data:', {
      companyName,
      tagline,
      description: description ? `${description.substring(0, 50)}...` : 'Empty',
      foundedYear,
      hasCustomerSupport: !!customerSupport,
      hasLocation: !!location,
      hasSocialMedia: !!socialMedia,
      hasPolicies: !!policies
    });

    // Log file information
    if (req.files) {
      console.log('📁 Files received:', Object.keys(req.files));
      for (const fileType in req.files) {
        console.log(`  ${fileType}:`, req.files[fileType].map(f => ({
          originalname: f.originalname,
          path: f.path,
          size: f.size
        })));
      }
    }

    const updateData = {
      company: {
        ...businessDetails.company,
        name: companyName || businessDetails.company.name,
        tagline: tagline || businessDetails.company.tagline,
        description: description || businessDetails.company.description,
        foundedYear: foundedYear || businessDetails.company.foundedYear
      }
    };
    
    // Parse JSON strings if they exist
    if (customerSupport) {
      try {
        updateData.contact = {
          ...businessDetails.contact,
          customerSupport: typeof customerSupport === 'string' ? JSON.parse(customerSupport) : customerSupport
        };
        console.log('✅ Processed customer support data');
      } catch (parseError) {
        console.error('❌ Error parsing customerSupport:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid customer support data format'
        });
      }
    }
    
    if (location) {
      try {
        updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
        console.log('✅ Processed location data');
      } catch (parseError) {
        console.error('❌ Error parsing location:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid location data format'
        });
      }
    }
    
    if (socialMedia) {
      try {
        updateData.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
        console.log('✅ Processed social media data');
      } catch (parseError) {
        console.error('❌ Error parsing socialMedia:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid social media data format'
        });
      }
    }
    
    if (policies) {
      try {
        updateData.policies = typeof policies === 'string' ? JSON.parse(policies) : policies;
        console.log('✅ Processed policies data');
      } catch (parseError) {
        console.error('❌ Error parsing policies:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid policies data format'
        });
      }
    }
    
    // Handle logo uploads with better error handling
    if (req.files) {
      updateData.logos = { ...businessDetails.logos };
      
      // Process website logo
      if (req.files.websiteLogo && req.files.websiteLogo[0]) {
        await processLogoUpload({
          file: req.files.websiteLogo[0],
          logoType: 'website',
          businessDetails,
          updateData,
          uploadedFiles
        });
      }
      
      // Process admin logo
      if (req.files.adminLogo && req.files.adminLogo[0]) {
        await processLogoUpload({
          file: req.files.adminLogo[0],
          logoType: 'admin',
          businessDetails,
          updateData,
          uploadedFiles
        });
      }
      
      // Process favicon
      if (req.files.favicon && req.files.favicon[0]) {
        await processLogoUpload({
          file: req.files.favicon[0],
          logoType: 'favicon',
          businessDetails,
          updateData,
          uploadedFiles
        });
      }
    }
    
    console.log('💾 Saving updated business details...');
    businessDetails = await BusinessDetails.findByIdAndUpdate(
      businessDetails._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('✅ Business details updated successfully');
    
    res.json({
      success: true,
      message: 'Company details updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('❌ Update company details error:', error);
    
    // Clean up uploaded files on error
    await cleanupUploadedFiles(req.files, uploadedFiles);
    
    // Handle specific error types
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Token expired'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating company details',
      error: error.message
    });
  }
};

// Helper function to process logo uploads
async function processLogoUpload({ file, logoType, businessDetails, updateData, uploadedFiles }) {
  try {
    console.log(`📷 Processing ${logoType} logo upload:`, {
      originalname: file.originalname,
      path: file.path,
      size: file.size
    });

    // Check if file exists before processing
    try {
      await fs.access(file.path);
    } catch (accessError) {
      console.warn(`⚠️ File does not exist, skipping ${logoType} logo:`, file.path);
      return;
    }

    // Delete old logo from Cloudinary if exists
    if (businessDetails.logos[logoType]?.public_id) {
      await cloudinary.uploader.destroy(businessDetails.logos[logoType].public_id);
      console.log(`🗑️ Deleted old ${logoType} logo`);
    }
    
    // Upload new logo to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'natura-bliss/logos'
    });
    
    updateData.logos[logoType] = {
      url: result.secure_url,
      public_id: result.public_id
    };
    
    // Delete local file after successful upload
    await fs.unlink(file.path);
    uploadedFiles.push(file.path);
    console.log(`✅ ${logoType} logo uploaded successfully`);
    
  } catch (error) {
    console.error(`❌ Error processing ${logoType} logo:`, error.message);
    throw error; // Re-throw to be caught by main try-catch
  }
}

// Helper function to clean up uploaded files
async function cleanupUploadedFiles(files, uploadedFiles) {
  if (!files) return;
  
  console.log('🧹 Cleaning up uploaded files due to error');
  for (const fileType in files) {
    for (const file of files[fileType]) {
      // Only delete if we haven't already processed this file
      if (!uploadedFiles.includes(file.path)) {
        try {
          // Check if file exists before trying to delete
          await fs.access(file.path);
          await fs.unlink(file.path);
          console.log(`🗑️ Cleaned up unprocessed file: ${file.path}`);
        } catch (unlinkError) {
          if (unlinkError.code === 'ENOENT') {
            console.log(`ℹ️ File already deleted: ${file.path}`);
          } else {
            console.warn(`⚠️ Could not delete file ${file.path}:`, unlinkError.message);
          }
        }
      } else {
        console.log(`ℹ️ File already processed: ${file.path}`);
      }
    }
  }
}

export const updateContactDetails = async (req, res) => {
  try {
    console.log('=== UPDATE CONTACT DETAILS REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const { customerSupport } = req.body;
    
    businessDetails.contact.customerSupport = {
      ...businessDetails.contact.customerSupport,
      ...customerSupport
    };
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: 'Contact details updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Update contact details error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error updating contact details',
      error: error.message
    });
  }
};

export const updateSocialMedia = async (req, res) => {
  try {
    console.log('=== UPDATE SOCIAL MEDIA REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    businessDetails.socialMedia = {
      ...businessDetails.socialMedia,
      ...req.body
    };
    
    await businessDetails.save();
    
    res.json({
      success: false,
      message: 'Social media updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Update social media error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error updating social media',
      error: error.message
    });
  }
};

export const updatePolicies = async (req, res) => {
  try {
    console.log('=== UPDATE POLICIES REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    businessDetails.policies = {
      ...businessDetails.policies,
      ...req.body
    };
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: 'Policies updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Update policies error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error updating policies',
      error: error.message
    });
  }
};

// ========================
// STORE MANAGEMENT CONTROLLERS
// ========================

export const addStore = async (req, res) => {
  try {
    console.log('=== ADD STORE REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const newStore = {
      storeId: `STORE${Date.now()}`,
      ...req.body,
      isActive: true,
      status: 'active'
    };
    
    // Handle store logo using your upload middleware
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'natura-bliss/stores'
      });
      
      newStore.storeLogo = {
        url: result.secure_url,
        public_id: result.public_id
      };
      
      await fs.unlink(req.file.path);
    }
    
    businessDetails.multiStore.stores.push(newStore);
    
    if (businessDetails.multiStore.stores.length === 1) {
      businessDetails.multiStore.enabled = true;
      businessDetails.multiStore.defaultStore = newStore.storeId;
    }
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: 'Store added successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Add store error:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error adding store',
      error: error.message
    });
  }
};

export const updateStore = async (req, res) => {
  try {
    console.log('=== UPDATE STORE REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    const { storeId } = req.params;
    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const storeIndex = businessDetails.multiStore.stores.findIndex(
      store => store.storeId === storeId
    );
    
    if (storeIndex === -1) {
      return res.json({
        success: false,
        message: 'Store not found'
      });
    }
    
    businessDetails.multiStore.stores[storeIndex] = {
      ...businessDetails.multiStore.stores[storeIndex],
      ...req.body
    };
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: 'Store updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Update store error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error updating store',
      error: error.message
    });
  }
};

export const updateStoreLogo = async (req, res) => {
  try {
    console.log('=== UPDATE STORE LOGO REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    const { storeId } = req.params;
    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const storeIndex = businessDetails.multiStore.stores.findIndex(
      store => store.storeId === storeId
    );
    
    if (storeIndex === -1) {
      return res.json({
        success: false,
        message: 'Store not found'
      });
    }
    
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No logo file provided'
      });
    }
    
    const oldLogo = businessDetails.multiStore.stores[storeIndex].storeLogo;
    if (oldLogo?.public_id) {
      await cloudinary.uploader.destroy(oldLogo.public_id);
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'natura-bliss/stores'
    });
    
    businessDetails.multiStore.stores[storeIndex].storeLogo = {
      url: result.secure_url,
      public_id: result.public_id
    };
    
    await businessDetails.save();
    await fs.unlink(req.file.path);
    
    res.json({
      success: true,
      message: 'Store logo updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Update store logo error:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error updating store logo',
      error: error.message
    });
  }
};

export const toggleStoreStatus = async (req, res) => {
  try {
    console.log('=== TOGGLE STORE STATUS REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    const { storeId } = req.params;
    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const storeIndex = businessDetails.multiStore.stores.findIndex(
      store => store.storeId === storeId
    );
    
    if (storeIndex === -1) {
      return res.json({
        success: false,
        message: 'Store not found'
      });
    }
    
    businessDetails.multiStore.stores[storeIndex].isActive = 
      !businessDetails.multiStore.stores[storeIndex].isActive;
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: `Store ${businessDetails.multiStore.stores[storeIndex].isActive ? 'activated' : 'deactivated'} successfully`,
      data: businessDetails
    });
  } catch (error) {
    console.error('Toggle store status error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error updating store status',
      error: error.message
    });
  }
};

export const deleteStore = async (req, res) => {
  try {
    console.log('=== DELETE STORE REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    const { storeId } = req.params;
    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const storeIndex = businessDetails.multiStore.stores.findIndex(
      store => store.storeId === storeId
    );
    
    if (storeIndex === -1) {
      return res.json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Delete store logo from Cloudinary if exists
    const storeLogo = businessDetails.multiStore.stores[storeIndex].storeLogo;
    if (storeLogo?.public_id) {
      await cloudinary.uploader.destroy(storeLogo.public_id);
    }
    
    // Remove store from array
    businessDetails.multiStore.stores.splice(storeIndex, 1);
    
    // Disable multi-store if no stores left
    if (businessDetails.multiStore.stores.length === 0) {
      businessDetails.multiStore.enabled = false;
      businessDetails.multiStore.defaultStore = null;
    }
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: 'Store deleted successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Delete store error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error deleting store',
      error: error.message
    });
  }
};

export const setDefaultStore = async (req, res) => {
  try {
    console.log('=== SET DEFAULT STORE REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    const { storeId } = req.params;
    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    const storeExists = businessDetails.multiStore.stores.some(
      store => store.storeId === storeId
    );
    
    if (!storeExists) {
      return res.json({
        success: false,
        message: 'Store not found'
      });
    }
    
    businessDetails.multiStore.defaultStore = storeId;
    await businessDetails.save();
    
    res.json({
      success: true,
      message: 'Default store updated successfully',
      data: businessDetails
    });
  } catch (error) {
    console.error('Set default store error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error setting default store',
      error: error.message
    });
  }
};

export const toggleMultiStore = async (req, res) => {
  try {
    console.log('=== TOGGLE MULTI-STORE REQUEST ===');
    
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    
    businessDetails.multiStore.enabled = !businessDetails.multiStore.enabled;
    
    await businessDetails.save();
    
    res.json({
      success: true,
      message: `Multi-store ${businessDetails.multiStore.enabled ? 'enabled' : 'disabled'} successfully`,
      data: businessDetails
    });
  } catch (error) {
    console.error('Toggle multi-store error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized Login Again'
      });
    }
    
    res.json({
      success: false,
      message: 'Error toggling multi-store',
      error: error.message
    });
  }
};

// ========================
// LOGO DELETION CONTROLLER
// ========================

export const deleteLogo = async (req, res) => {
  try {
    console.log('=== DELETE LOGO REQUEST ===');
    console.log('Headers:', {
      token: req.headers.token ? 'Present' : 'Missing',
      logoType: req.params.logoType
    });

    // Check authentication
    if (!req.headers.token) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: No token provided'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.email);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Invalid or expired token'
      });
    }

    const { logoType } = req.params;
    const validLogoTypes = ['website', 'admin', 'favicon'];
    
    if (!validLogoTypes.includes(logoType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid logo type. Must be one of: website, admin, favicon'
      });
    }

    let businessDetails = await BusinessDetails.getBusinessDetails();
    console.log('Found business details:', businessDetails._id);
    
    // Check if logo exists
    const existingLogo = businessDetails.logos[logoType];
    if (!existingLogo || !existingLogo.public_id) {
      return res.json({
        success: false,
        message: `No ${logoType} logo found to delete`
      });
    }

    console.log(`Deleting ${logoType} logo:`, existingLogo.public_id);
    
    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(existingLogo.public_id);
      console.log(`✅ ${logoType} logo deleted from Cloudinary`);
    } catch (cloudinaryError) {
      console.warn(`⚠️ Could not delete from Cloudinary:`, cloudinaryError.message);
      // Continue with database update even if Cloudinary deletion fails
    }
    
    // Update business details to remove the logo
    businessDetails.logos[logoType] = { url: "", public_id: "" };
    await businessDetails.save();
    
    console.log(`✅ ${logoType} logo removed from database`);
    
    res.json({
      success: true,
      message: `${logoType} logo deleted successfully`,
      data: businessDetails
    });
    
  } catch (error) {
    console.error('❌ Delete logo error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized: Please login again'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting logo',
      error: error.message
    });
  }
};