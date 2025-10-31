const express = require("express");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const productsRouter = require("./routes/products");
const productImagesRouter = require("./routes/productImages");
const categoryRouter = require("./routes/category");
const searchRouter = require("./routes/search");
const mainImageRouter = require("./routes/mainImages");
const userRouter = require("./routes/users");
const orderRouter = require("./routes/customer_orders");
const slugRouter = require("./routes/slugs");
const orderProductRouter = require('./routes/customer_order_product');
const wishlistRouter = require('./routes/wishlist');
const notificationsRouter = require('./routes/notifications');
const merchantRouter = require('./routes/merchant');
const adminRouter = require('./routes/admin');
const bulkUploadRouter = require('./routes/bulkUpload');
const walletRouter = require('./routes/wallet');
const cors = require("cors");

const { addRequestId, requestLogger, errorLogger, securityLogger } = require('./middleware/requestLogger');
const {
  generalLimiter,
  authLimiter,
  registerLimiter,
  userManagementLimiter,
  uploadLimiter,
  searchLimiter,
  orderLimiter
} = require('./middleware/rateLimiter');

const {
  passwordResetLimiter,
  adminLimiter,
  wishlistLimiter,
  productLimiter
} = require('./middleware/advancedRateLimiter');

const { handleServerError } = require('./utills/errorHandler');

const app = express();

app.set('trust proxy', 1);
app.use(addRequestId);
app.use(securityLogger);
app.use(requestLogger);
app.use(errorLogger);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXTAUTH_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Remove express-fileupload completely
// app.use(fileUpload()); ❌ REMOVE THIS LINE

// ✅ Allow JSON only for non-multipart requests
app.use(express.json());

// ✅ Rate limiters
app.use(generalLimiter);
app.use("/api/users", userManagementLimiter);
app.use("/api/search", searchLimiter);
app.use("/api/orders", orderLimiter);
app.use("/api/order-product", orderLimiter);
app.use("/api/images", uploadLimiter);
app.use("/api/main-image", uploadLimiter);
app.use("/api/wishlist", wishlistLimiter);
app.use("/api/products", productLimiter);
app.use("/api/merchants", productLimiter);
app.use("/api/bulk-upload", uploadLimiter);
app.use("/api/users/email", authLimiter);
app.use("/api/users", adminLimiter);

// ✅ Routers
app.use("/api/products", productsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/images", productImagesRouter);
app.use("/api/main-image", mainImageRouter);
app.use("/api/users", userRouter);
app.use("/api/search", searchRouter);
app.use("/api/orders", orderRouter);
app.use("/api/order-product", orderProductRouter);
app.use("/api/slugs", slugRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/merchants", merchantRouter);
app.use("/api/bulk-upload", bulkUploadRouter);
app.use("/api/admin", adminRouter);
app.use("/api/wallet", walletRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    requestId: req.reqId
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', requestId: req.reqId });
});

app.use((err, req, res, next) => {
  handleServerError(err, res, `${req.method} ${req.path}`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
