
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware: Correlation Tracer
 * Ensures every request has a unique X-Correlation-ID
 * 
 * 1. Checks incoming header (service-to-service)
 * 2. Generates new UUID if missing
 * 3. Attaches to Reques/Response objects
 * 4. Injects into logger context
 */
export const correlationMiddleware = (req, res, next) => {
    // 1. Check existing
    const existingId = req.headers['x-correlation-id'] || req.headers['x-request-id'];

    // 2. Generate or reuse
    const correlationId = existingId || uuidv4();

    // 3. Attach to context
    req.id = correlationId; // Standard Pino convention
    req.correlationId = correlationId; // Internal usage convention

    // 4. Set response header for client traceability
    res.setHeader('X-Correlation-ID', correlationId);

    next();
};
