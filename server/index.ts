import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { prisma } from './db';

import adminRoutes from './routes/adminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import settingsRoutes from './routes/settingsRoutes';
import imageRoutes from './routes/imageRoutes';
import preBookingRoutes from './routes/preBookingRoutes';
import enquiryRoutes from './routes/enquiryRoutes';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const missing = requiredEnvVars.filter((env) => !process.env[env]);
if (missing.length > 0) {
  console.warn(`[Startup Warning] Missing environment variables: ${missing.join(', ')}. Some features may degrade gracefully.`);
}

const app = express();
const port = process.env.PORT || 5000;

// Ensure public/uploads directory exists for resilient local image fallback
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==========================================
// Security Headers Middleware
// ==========================================
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ==========================================
// Centralized Production CORS Configuration
// ==========================================

const defaultAllowedOrigins = [
  'https://ingmotorparts.com.lk',
  'https://www.ingmotorparts.com.lk',
  'https://ingmotoparts.com.lk',
  'https://www.ingmotoparts.com.lk',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
];

const normalizeOrigin = (url: string): string => {
  return url.trim().replace(/\/+$/, '').toLowerCase();
};

const parseAllowedOrigins = (): Set<string> => {
  const allowed = new Set<string>(defaultAllowedOrigins.map(normalizeOrigin));

  const envOrigins = [process.env.FRONTEND_URL, process.env.ALLOWED_ORIGINS];
  for (const envVar of envOrigins) {
    if (envVar) {
      envVar.split(/[,\s]+/).forEach((item) => {
        const trimmed = normalizeOrigin(item);
        if (trimmed) {
          allowed.add(trimmed);
          try {
            const parsed = new URL(trimmed);
            if (parsed.hostname.startsWith('www.')) {
              const noWww = `${parsed.protocol}//${parsed.hostname.slice(4)}${parsed.port ? `:${parsed.port}` : ''}`;
              allowed.add(noWww);
            } else {
              const withWww = `${parsed.protocol}//www.${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}`;
              allowed.add(withWww);
            }
          } catch {
            // Ignore malformed URLs in env
          }
        }
      });
    }
  }

  return allowed;
};

const allowedOriginSet = parseAllowedOrigins();

export const isOriginAllowed = (origin: string): boolean => {
  const normalized = normalizeOrigin(origin);
  if (allowedOriginSet.has(normalized)) {
    return true;
  }
  // Allow all localhost origins during development or testing
  if (process.env.NODE_ENV !== 'production') {
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
      return true;
    }
  }
  // Allow Vercel preview deployment URLs (e.g. *.vercel.app)
  if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalized)) {
    return true;
  }
  // Allow any subdomain of ingmotorparts.com.lk or ingmotoparts.com.lk
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)?ingmotor?parts\.com\.lk$/.test(normalized)) {
    return true;
  }
  return false;
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, server-to-server, curl)
    if (!origin) {
      return callback(null, true);
    }
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Deny unauthorized origins safely without throwing unhandled 500 error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};

// 1. CORS Middleware applied first before any route
app.use(cors(corsOptions));
// Handle preflight explicitly (Express 5 compatible wildcard)
app.options('/{0,}', cors(corsOptions));

// 2. Body Parser with 10MB request size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Static serving for public images and local uploads
app.use('/images', express.static(path.resolve(process.cwd(), 'public', 'images')));
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// Lightweight Rate Limiter for Sensitive Routes
// ==========================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const sensitiveRateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${ip}-${req.baseUrl}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      const origin = req.headers.origin as string | undefined;
      if (origin && isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    record.count++;
    next();
  };
};

// ==========================================
// Comprehensive Health & Diagnostics Endpoint
// ==========================================

const getSanitizedDbInfo = () => {
  const rawUrl = process.env.DATABASE_URL || '';
  try {
    const parsed = new URL(rawUrl);
    return {
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname,
      port: parsed.port || 'default',
      database: parsed.pathname.replace(/^\//, ''),
    };
  } catch {
    return {
      protocol: 'unknown',
      host: 'unparseable',
      port: 'unknown',
      database: 'unknown',
    };
  }
};

const startTime = Date.now();

app.get('/api/health', async (_req: Request, res: Response) => {
  let dbStatus = 'connected';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = 'disconnected';
    dbError = err?.message || 'Database connection probe failed';
  }

  const isHealthy = dbStatus === 'connected';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'ok' : 'degraded',
    server: 'running',
    version: '1.0.0',
    build: process.env.RENDER_GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || 'main-latest',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    prisma: {
      status: isHealthy ? 'ready' : 'error',
    },
    database: {
      status: dbStatus,
      target: getSanitizedDbInfo(),
      ...(dbError ? { error: dbError } : {})
    }
  });
});

// ==========================================
// Application API Routes
// ==========================================

// Apply rate limiter to auth endpoints (max 15 attempts per 5 minutes)
app.use('/api/admin/login', sensitiveRateLimiter(15, 5 * 60 * 1000));
// Apply rate limiter to order creation (max 20 submissions per 10 minutes)
app.use('/api/orders', sensitiveRateLimiter(20, 10 * 60 * 1000));

app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/pre-bookings', preBookingRoutes);
app.use('/api/enquiries', enquiryRoutes);

// ==========================================
// Global 404 & Error Handler with CORS Protection
// ==========================================

// Handle unknown API routes
app.use((req: Request, res: Response) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler ensuring CORS headers are preserved on failure
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);

  const origin = req.headers.origin as string | undefined;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  const statusCode = typeof err.status === 'number' ? err.status : 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
