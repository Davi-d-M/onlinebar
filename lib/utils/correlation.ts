import { v4 as uuidv4 } from 'uuid';

/**
 * ONLINE BAR: CORRELATION UTILITY
 * Manages unique identifiers for tracing requests across the system.
 */

export function generateCorrelationId(): string {
    return `CORR-${uuidv4().substring(0, 8).toUpperCase()}`;
}

export function generateRequestId(): string {
    return `REQ-${uuidv4().substring(0, 8).toUpperCase()}`;
}

/**
 * Inits the current request context (Works in Edge/Node environments)
 */
export function initRequestContext(correlationId?: string) {
    (global as any).currentCorrelationId = correlationId || generateCorrelationId();
    (global as any).currentRequestId = generateRequestId();

    return {
        correlationId: (global as any).currentCorrelationId,
        requestId: (global as any).currentRequestId
    };
}
