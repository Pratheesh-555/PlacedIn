import cloudinary from '../config/cloudinary.js';

// Test Cloudinary configuration
export const testCloudinary = async () => {
  try {
    console.log('Testing Cloudinary configuration...');
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API key exists:', !!process.env.CLOUDINARY_API_KEY);
    console.log('API secret exists:', !!process.env.CLOUDINARY_API_SECRET);
    
    // Test a simple API call
    const result = await cloudinary.api.ping();
    console.log('Cloudinary ping successful:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary test failed:', error);
    return false;
  }
};

export default testCloudinary;
