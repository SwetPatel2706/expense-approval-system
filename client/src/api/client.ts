import { useAuthStore } from '../store/useAuthStore';
import type { ApiError } from '../types';

/**
 * Thrown when the server returns 401 Unauthorized.
 * RequireAuth component handles redirect to /login when user becomes null.
 */
export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized');
        this.name = 'UnauthorizedError';
    }
}

/**
 * Centralized authenticated fetch wrapper.
 *
 * Auth strategy (transitional):
 *  - Sends `Authorization: Bearer <token>` header for future JWT validation.
 *  - Also sends legacy `x-user-id / x-user-role / x-company-id` headers so the
 *    current backend (which hasn't adopted JWT yet) continues to function.
 *  - Precedence rule: ANY 401 response logs the user out immediately, regardless
 *    of which header the backend validated. This prevents desync bugs during migration.
 *
 * Other guarantees:
 *  - Guards JSON parsing: only calls .json() if Content-Type is application/json
 *    (prevents masking real HTTP errors from proxies that return HTML)
 *  - Preserves HTTP status on thrown error (critical for 409 Conflict handling)
 *  - Throws ApiError on non-2xx, UnauthorizedError on 401
 */
export async function fetchClient<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const { user, token } = useAuthStore.getState();

    if (!user) {
        throw {
            errorCode: 'UNAUTHENTICATED',
            message: 'User not authenticated',
            status: 401,
        } satisfies ApiError;
    }

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    // JWT header — backend will validate once JWT flow is implemented
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Legacy headers — kept during transitional period, remove after backend adopts JWT
    headers.set('x-user-id', user.id);
    headers.set('x-user-role', user.role);
    headers.set('x-company-id', user.companyId);

    const response = await fetch(endpoint, { ...options, headers });

    // 401: treat as authoritative logout trigger (transitional auth rule)
    if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new UnauthorizedError();
    }

    // Guard against non-JSON bodies (e.g. 502 from reverse proxy returns HTML)
    const contentType = response.headers.get('Content-Type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            const errorBody = (await response.json()) as Omit<ApiError, 'status'>;
            throw { ...errorBody, status: response.status } satisfies ApiError;
        }
        // Non-JSON error body — construct a minimal ApiError
        throw {
            errorCode: 'HTTP_ERROR',
            message: response.statusText || `HTTP ${response.status}`,
            status: response.status,
        } satisfies ApiError;
    }

    return (await response.json()) as T;
}
