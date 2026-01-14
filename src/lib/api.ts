import { toast } from "@/components/ui/sonner";
import { APIError } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export class HTTPError extends Error {
    status: number;
    statusText: string;

    constructor(status: number, statusText: string, message: string) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.name = "HTTPError";
    }
}

/**
 * Parse error detail from FastAPI HTTPException format
 */
function parseErrorDetail(data: APIError): string {
    if (typeof data.detail === "string") {
        return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
        return data.detail.map((d) => d.msg).join(", ");
    }
    return "An error occurred";
}

/**
 * Show toast notification for HTTP errors
 */
function showErrorToast(status: number, message: string) {
    const errorMessages: Record<number, string> = {
        400: "Bad Request",
        401: "Please log in to continue",
        403: "You don't have permission to do this",
        404: "Not found",
        422: "Validation error",
        500: "Server error. Please try again later",
    };

    const title = errorMessages[status] || `Error ${status}`;

    toast.error(title, {
        description: message,
        duration: 5000,
    });
}

interface FetchOptions extends RequestInit {
    showToast?: boolean;
}

/**
 * Fetch wrapper with automatic error handling and toast notifications
 */
export async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { showToast = true, ...fetchOptions } = options;

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
        });

        if (!response.ok) {
            let errorMessage = response.statusText;

            try {
                const errorData = (await response.json()) as APIError;
                errorMessage = parseErrorDetail(errorData);
            } catch {
                // Response body is not JSON
            }

            if (showToast) {
                showErrorToast(response.status, errorMessage);
            }

            throw new HTTPError(response.status, response.statusText, errorMessage);
        }

        // Handle empty responses
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            return response.json() as Promise<T>;
        }

        return {} as T;
    } catch (error) {
        if (error instanceof HTTPError) {
            throw error;
        }

        // Network error
        const message = error instanceof Error ? error.message : "Network error";
        if (showToast) {
            toast.error("Connection failed", {
                description: message,
                duration: 5000,
            });
        }

        throw new Error(message);
    }
}

/**
 * Authenticated fetch wrapper - includes auth token in headers
 */
export async function authFetch<T>(
    endpoint: string,
    token: string,
    options: FetchOptions = {}
): Promise<T> {
    return apiFetch<T>(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}
