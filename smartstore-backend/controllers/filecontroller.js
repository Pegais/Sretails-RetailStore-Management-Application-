const cloudinary = require('../config/cloudinary');

const listCloudinaryFiles = async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'smartstore_inventory/',
      max_results: 30,
    });

    const files = result.resources.map((file) => ({
      public_id: file.public_id,
      url: file.secure_url,
      format: file.format,
      created_at: file.created_at,
    }));

    res.status(200).json({ files });
  } catch (error) {
    console.error('Error fetching Cloudinary files:', error);
    res.status(500).json({ error: 'Failed to fetch files from Cloudinary' });
  }
};

module.exports = { listCloudinaryFiles };
