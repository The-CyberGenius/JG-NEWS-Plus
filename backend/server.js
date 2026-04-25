import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import connectDB from './config/db.js';

// Route imports
import articleRoutes from './routes/articles.js';
import categoryRoutes from './routes/categories.js';
import settingRoutes from './routes/settings.js';
import adminRoutes from './routes/admin.js';
import newspaperRoutes from './routes/newspapers.js';
import uploadRoutes from './routes/upload.js';
import newsSyncRoutes from './routes/newsSync.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Connect to Database
connectDB();

// API Routes
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newspapers', newspaperRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/news-sync', newsSyncRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api', (req, res) => {
    res.send('JG NEWS PLUS API is running...');
});

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
