const express=require('express')
const upload=require('../middlewares/multerUpload')
const { listCloudinaryFiles } = require('../controllers/filecontroller');

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const fileUrl = req.file.path; // Cloudinary URL
    res.status(200).json({ success: true, url: fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
});

// POST /api/upload/multiple
router.post('/upload/multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      url: file.path,
    }));

    res.status(200).json({ message: 'Files uploaded successfully', files: uploadedFiles });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'File upload failed', error: err.message });
  }
});


router.get('/upload/list', listCloudinaryFiles);

module.exports = router;
