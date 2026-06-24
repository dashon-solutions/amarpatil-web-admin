const SiteSettings = require("../models/SiteSettings.model");
const Banner = require("../models/Banner.model");
const Testimonial = require("../models/Testimonial.model");
const Package = require("../models/Package.model");
const About = require("../models/About.model");
const Contact = require("../models/Contact.model");
const Category = require("../models/Category.model");
const Gallery = require("../models/Gallery.model");
const Story = require("../models/Story.model");

// ==========================================
// SITE SETTINGS (Singleton)
// ==========================================
exports.getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching site settings", error: err.message });
  }
};

exports.updateSiteSettings = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Parse nested objects if sent as strings (e.g. FormData)
    if (typeof updateData.contact === 'string') updateData.contact = JSON.parse(updateData.contact);
    if (typeof updateData.socialLinks === 'string') updateData.socialLinks = JSON.parse(updateData.socialLinks);
    if (typeof updateData.meta === 'string') updateData.meta = JSON.parse(updateData.meta);
    if (typeof updateData.termsAndConditions === 'string') updateData.termsAndConditions = JSON.parse(updateData.termsAndConditions);

    if (updateData.showTeam !== undefined) {
      updateData.showTeam = updateData.showTeam === 'true' || updateData.showTeam === true;
    }

    // Handle Uploads if exist
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) updateData.logo = req.files.logo[0].cloudinaryUrl;
      if (req.files.stamp && req.files.stamp[0]) updateData.stamp = req.files.stamp[0].cloudinaryUrl;
      if (req.files.signature && req.files.signature[0]) updateData.signature = req.files.signature[0].cloudinaryUrl;
    }

    const settings = await SiteSettings.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Error updating site settings", error: err.message });
  }
};

// ==========================================
// BANNERS
// ==========================================
exports.getBanners = async (req, res) => {
  try {
    const filter = req.query.public === 'true' ? { isActive: true } : {};
    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Error fetching banners", error: err.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) data.mainImage = req.files.mainImage[0].cloudinaryUrl;
      if (req.files.sideImage && req.files.sideImage[0]) data.sideImage = req.files.sideImage[0].cloudinaryUrl;
    }
    const banner = await Banner.create(data);
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: "Error creating banner", error: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) data.mainImage = req.files.mainImage[0].cloudinaryUrl;
      if (req.files.sideImage && req.files.sideImage[0]) data.sideImage = req.files.sideImage[0].cloudinaryUrl;
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: "Error updating banner", error: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting banner", error: err.message });
  }
};

// ==========================================
// TESTIMONIALS
// ==========================================
exports.getTestimonials = async (req, res) => {
  try {
    const filter = req.query.public === 'true' ? { isActive: true } : {};
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching testimonials", error: err.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const testimonial = await Testimonial.create(data);
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ message: "Error creating testimonial", error: err.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ message: "Error updating testimonial", error: err.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting testimonial", error: err.message });
  }
};

// ==========================================
// PACKAGES
// ==========================================
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching packages", error: err.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
    
    // Maps variant images if uploaded (assuming name format `variantImage_0`, `variantImage_1`, etc)
    if (req.files && data.variants) {
      data.variants = data.variants.map((variant, index) => {
        const fileField = req.files[`variantImage_${index}`];
        if (fileField && fileField[0]) {
          variant.image = fileField[0].cloudinaryUrl;
        }
        return variant;
      });
    }

    const pkg = await Package.create(data);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ message: "Error creating package", error: err.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);

    if (req.files && data.variants) {
      data.variants = data.variants.map((variant, index) => {
        const fileField = req.files[`variantImage_${index}`];
        if (fileField && fileField[0]) {
          variant.image = fileField[0].cloudinaryUrl;
        }
        return variant;
      });
    }

    const pkg = await Package.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: "Error updating package", error: err.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting package", error: err.message });
  }
};

// ==========================================
// ABOUT US
// ==========================================
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching About Us", error: err.message });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const about = await About.findOneAndUpdate({}, data, { new: true, upsert: true });
    res.json(about);
  } catch (err) {
    res.status(500).json({ message: "Error updating About Us", error: err.message });
  }
};

// ==========================================
// CONTACT US
// ==========================================
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.json(contact || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching Contact Us", error: err.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const data = { ...req.body };
    const contact = await Contact.findOneAndUpdate({}, data, { new: true, upsert: true });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Error updating Contact Us", error: err.message });
  }
};

// ==========================================
// CATEGORIES
// ==========================================
exports.getCategories = async (req, res) => {
  try {
    const filter = req.query.public === 'true' ? { isActive: true } : {};
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const category = await Category.create(data);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
};

// ==========================================
// GALLERIES
// ==========================================
exports.getGalleries = async (req, res) => {
  try {
    const filter = req.query.public === 'true' ? { isActive: true } : {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === 'true';

    const galleries = await Gallery.find(filter).populate('category').sort({ createdAt: -1 });
    res.json(galleries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching galleries", error: err.message });
  }
};

exports.createGallery = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const gallery = await Gallery.create(data);
    res.status(201).json(gallery);
  } catch (err) {
    res.status(500).json({ message: "Error creating gallery", error: err.message });
  }
};

exports.updateGallery = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.cloudinaryUrl;
    const gallery = await Gallery.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: "Error updating gallery", error: err.message });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "Gallery deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting gallery", error: err.message });
  }
};

// ==========================================
// STORIES
// ==========================================
exports.getStories = async (req, res) => {
  try {
    const filter = req.query.public === 'true' ? { isActive: true } : {};
    if (req.query.showOnHome) filter.showOnHome = req.query.showOnHome === 'true';
    const stories = await Story.find(filter).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stories", error: err.message });
  }
};

exports.getStoryBySlug = async (req, res) => {
  try {
    const story = await Story.findOne({ slug: req.params.slug });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: "Error fetching story", error: err.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) data.mainImage = req.files.mainImage[0].cloudinaryUrl;
      if (req.files.sideImage && req.files.sideImage[0]) data.sideImage = req.files.sideImage[0].cloudinaryUrl;
      
      const galleryImages = [];
      for (const key in req.files) {
        if (key.startsWith('galleryImages_') && req.files[key][0]) {
          galleryImages.push(req.files[key][0].cloudinaryUrl);
        }
      }
      if (galleryImages.length > 0) data.galleryImages = galleryImages;
    }
    const story = await Story.create(data);
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: "Error creating story", error: err.message });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) data.mainImage = req.files.mainImage[0].cloudinaryUrl;
      if (req.files.sideImage && req.files.sideImage[0]) data.sideImage = req.files.sideImage[0].cloudinaryUrl;
      
      const newGalleryImages = [];
      for (const key in req.files) {
        if (key.startsWith('galleryImages_') && req.files[key][0]) {
          newGalleryImages.push(req.files[key][0].cloudinaryUrl);
        }
      }
      
      if (newGalleryImages.length > 0) {
        // If updating gallery images, we append or replace. Let's assume append or the client manages the array string manually.
        // For simplicity, we just use the new ones if provided, or the client handles deletion separately.
        const existingStory = await Story.findById(req.params.id);
        const existingGallery = existingStory.galleryImages || [];
        
        let clientExistingGallery = [];
        if (data.existingGalleryImages) {
          try {
             clientExistingGallery = JSON.parse(data.existingGalleryImages);
          } catch(e){}
        }

        data.galleryImages = [...clientExistingGallery, ...newGalleryImages];
      } else if (data.existingGalleryImages) {
        try {
           data.galleryImages = JSON.parse(data.existingGalleryImages);
        } catch(e){}
      }
    } else if (data.existingGalleryImages) {
      try {
         data.galleryImages = JSON.parse(data.existingGalleryImages);
      } catch(e){}
    }

    const story = await Story.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: "Error updating story", error: err.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: "Story deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting story", error: err.message });
  }
};
