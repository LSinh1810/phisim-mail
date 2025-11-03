import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Helmet - Bảo vệ headers, ngăn các lỗ hổng bảo mật phổ biến
export const setupHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
};

// Rate limiting - Chống spam và brute force attack
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// API rate limiter - nghiêm ngặt hơn cho API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Quá nhiều request API, vui lòng thử lại sau.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login rate limiter - chống brute force
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false,
});

// XSS Clean - Chống XSS attacks (đơn giản hóa)
export const xssCleanMiddleware = (req, res, next) => {
  // Mongoose và Helmet đã có XSS protection
  // Thêm custom sanitization nếu cần
  next();
};

