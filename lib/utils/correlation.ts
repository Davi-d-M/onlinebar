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
    const globalContext = global as unknown as Record<string, string>;
    globalContext.currentCorrelationId = correlationId || generateCorrelationId();
    globalContext.currentRequestId = generateRequestId();

    return {
        correlationId: globalContext.currentCorrelationId,
        requestId: globalContext.currentRequestId
    };
}
