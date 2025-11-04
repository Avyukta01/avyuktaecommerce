const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const productsRouter = require("./routes/products");
const productImagesRouter = require("./routes/productImages");
const categoryRouter = require("./routes/category");
const searchRouter = require("./routes/search");
const mainImageRouter = require("./routes/mainImages");
const userRouter = require("./routes/users");
const orderRouter = require("./routes/customer_orders");
const slugRouter = require("./routes/slugs");
const orderProductRouter = require("./routes/customer_order_product");
const wishlistRouter = require("./routes/wishlist");
const notificationsRouter = require("./routes/notifications");
const merchantRouter = require("./routes/merchant");
const adminRouter = require("./routes/admin");
const bulkUploadRouter = require("./routes/bulkUpload");
const walletRouter = require("./routes/wallet");
const cors = require("cors");
const productVideoRoutes = require("./routes/productVideos");
const adminMerchantRoute = require("./routes/adminMerchantRoute");





const {
  addRequestId,
  requestLogger,
  errorLogger,
  securityLogger,
} = require("./middleware/requestLogger");

const {
  generalLimiter,
  authLimiter,
  registerLimiter,
  userManagementLimiter,
  uploadLimiter,
  searchLimiter,
  orderLimiter,
} = require("./middleware/rateLimiter");

const {
  passwordResetLimiter,
  adminLimiter,
  wishlistLimiter,
  productLimiter,
} = require("./middleware/advancedRateLimiter");

const { handleServerError } = require("./utills/errorHandler");

const app = express();

app.set("trust proxy", 1);
app.use(addRequestId);
app.use(securityLogger);
app.use(requestLogger);
app.use(errorLogger);

// ✅ CORS Setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.NEXTAUTH_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (
      process.env.NODE_ENV === "development" &&
      origin.startsWith("http://localhost:")
    ) {
      return callback(null, true);
    }
    const msg =
      "The CORS policy for this site does not allow access from the specified Origin.";
    return callback(new Error(msg), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Allow JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve all files from /public folder
app.use(express.static(path.join(__dirname, "public"))); // 🔥 This line enables /public image access

// ✅ Apply Rate Limiters
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

// ✅ Register all routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/productImages", productImagesRouter);
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
app.use("/api/productVideos", productVideoRoutes);
app.use("/api/admin-merchants", adminMerchantRoute);
app.use("/api/product-discounts", require("./routes/productDiscountRoute"));



// ✅ Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    requestId: req.reqId,
  });
});

// ✅ 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found", requestId: req.reqId });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  handleServerError(err, res, `${req.method} ${req.path}`);
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
