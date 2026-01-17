import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const data = await pdf(req.file.buffer);
    const text = data.text.trim();

    if (!text) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    res.json({
      text,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;