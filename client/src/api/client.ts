import { useAuthStore } from '../store/useAuthStore';
import type { ApiError } from '../types';

/**
 * Centralized authenticated fetch wrapper.
 *
 * - Injects x-user-id / x-user-role / x-company-id from auth store
 * - Guards JSON parsing: only calls .json() if Content-Type is application/json
 *   (prevents masking real HTTP errors from proxies that return HTML)
 * - Preserves HTTP status on thrown error (critical for 409 Conflict handling)
 * - Throws ApiError on non-2xx responses
 */
export async function fetchClient<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const { user } = useAuthStore.getState();

    if (!user) {
        throw { errorCode: 'UNAUTHENTICATED', message: 'User not authenticated', status: 401 } satisfies ApiError;
    }

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('x-user-id', user.id);
    headers.set('x-user-role', user.role);
    headers.set('x-company-id', user.companyId);

    const response = await fetch(endpoint, { ...options, headers });

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
