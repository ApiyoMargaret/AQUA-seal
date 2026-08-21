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

  // Get Batches (with filters)
  app.get('/api/batches', async (req: Request, res: Response) => {
    try {
      const { siteId, species, status } = req.query;
      const batches = await storageAdapter.getAllBatches({
        siteId: siteId as string | undefined,
        species: species as any | undefined,
        status: status as string | undefined,
      });
      res.json({ success: true, count: batches.length, data: batches });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Single Batch
  app.get('/api/batches/:id', async (req: Request, res: Response) => {
    try {
      const batch = await storageAdapter.getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({ success: false, error: `Batch '${req.params.id}' not found` });
      }
      res.json({ success: true, data: batch });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create Batch (Validated with Zod)
  app.post('/api/batches', async (req: Request, res: Response) => {
    try {
      const parsed = CreateBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: parsed.error.issues,
        });
      }

      const newBatch = await storageAdapter.createBatch(parsed.data);
      res.status(201).json({
        success: true,
        message: 'Batch registered successfully and appended to ledger.',
        data: newBatch,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Append Event to Batch Ledger (Immutable event log)
  app.post('/api/batches/:id/events', async (req: Request, res: Response) => {
    try {
      const parsed = AppendEventSchema.safeParse({
        ...req.body,
        batchId: req.params.id,
      });
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Event validation failed',
          details: parsed.error.issues,
        });
      }

      const updatedBatch = await storageAdapter.appendEvent(parsed.data);
      res.json({
        success: true,
        message: `Event '${parsed.data.eventType}' appended with verified cryptographic hash.`,
        data: updatedBatch,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });