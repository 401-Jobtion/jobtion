import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import extractRouter from './routes/extract/route.js';
import parseResumeRouter from './routes/parse-resume/route.js';
import tailorResumeRouter from './routes/tailor-resume/route.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/extract', extractRouter);
app.use('/api/parse-resume', parseResumeRouter);
app.use('/api/tailor-resume', tailorResumeRouter);

// Basic Route
app.get('/', (req, res) => {
    res.send('Jobtion API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});