import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001; // Different port

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

// Basic experience routes without multer
app.get('/api/experiences', (req, res) => {
  res.json({ message: 'Experiences endpoint working', data: [] });
});

app.post('/api/experiences', (req, res) => {
  console.log('POST request received:', req.body);
  res.json({ message: 'Experience submitted successfully' });
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
