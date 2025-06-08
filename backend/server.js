import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors'; //  Import CORS
import config from './config.js'; //  Make sure you use `.js` in import
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRoute.js';
import orderRoute from './routes/orderRoute.js';
import uploadRoute from './routes/uploadRoute.js';

const __dirname = path.resolve(); //  Needed in ES modules

//  Connect to MongoDB
mongoose
  .connect(config.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error.message));

const app = express();

//  Enable CORS for all requests
app.use(cors());

//  Parse incoming JSON
app.use(bodyParser.json());

//  API Routes
app.use('/api/uploads', uploadRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);

//  Paypal config route
app.get('/api/config/paypal', (req, res) => {
  res.send(config.PAYPAL_CLIENT_ID);
});

//  Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

//  Serve frontend build (if you're bundling React in EC2)
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'));
});

//  Start server listening on all interfaces
const PORT = config.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started at http://0.0.0.0:${PORT}`);
});
