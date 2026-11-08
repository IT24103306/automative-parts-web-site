import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
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
  console.error(`FATAL ERROR: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;

// ==========================================
// CORS Configuration
// ==========================================

const defaultAllowedOrigins = [
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
  // Allow any subdomain of ingmotoparts.com.lk
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)?ingmotoparts\.com\.lk$/.test(normalized)) {
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
    // Deny unauthorized origins without throwing 500 error
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

// 2. Body Parser
app.use(express.json());

// ==========================================
// Health & Diagnostics Endpoints
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
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    message: isHealthy ? 'Automate Parts API is running' : 'Automate Parts API is running with database issues',
    timestamp: new Date().toISOString(),
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
