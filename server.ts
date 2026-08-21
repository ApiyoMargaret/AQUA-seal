import express, { Request, Response } from 'express';
import { LANDING_SITES, SPECIES_CATALOG } from './src/types/aqua-seal';
import { storageAdapter } from './src/lib/storage-adapter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[Aqua-Seal API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Aqua-Seal Lake Victoria Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      storage: 'InMemoryAppendLedgerAdapter',
    });
  });

  // Get Landing Sites
  app.get('/api/landing-sites', (req: Request, res: Response) => {
    res.json({ success: true, data: LANDING_SITES });
  });

  // Get Registered Boats
  app.get('/api/boats', async (req: Request, res: Response) => {
    const boats = await storageAdapter.getRegisteredBoats();
    res.json({ success: true, data: boats });
  });

  // Get Species Catalog
  app.get('/api/species', (req: Request, res: Response) => {
    res.json({ success: true, data: SPECIES_CATALOG });
  });