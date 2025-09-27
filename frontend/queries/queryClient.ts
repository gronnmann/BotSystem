import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {AuthError, PostgrestError} from "@supabase/supabase-js";


function parseSupabaseError(error: unknown): string {
    // Handle AuthError from Supabase Auth
    if (error instanceof AuthError) {
        return error.message || "Authentication error occurred";
    }

    // Handle PostgrestError from Supabase Database
    if (error && typeof error === "object" && "code" in error) {
        const pgError = error as PostgrestError;

        // Common PostgreSQL error codes with user-friendly messages
        const errorMessages: Record<string, string> = {
            "23505": "This record already exists",
            "23503": "Cannot delete - this item is referenced by other records",
            "23502": "Required field is missing",
            "42501": "Permission denied",
            "42P01": "Table does not exist",
            "42703": "Column does not exist",
        };

        if (pgError.code && errorMessages[pgError.code]) {
            return errorMessages[pgError.code];
        }

        // Return the error message if available
        if (pgError.message) {
            return pgError.message;
        }

        // Return details if message is not available
        if (pgError.details) {
            return pgError.details;
        }
    }

    // Handle generic Supabase errors
    if (error && typeof error === "object" && "message" in error) {
        const supabaseError = error as { message: string; code?: string; details?: string };
        return supabaseError.message || "An error occurred";
    }

    // Handle JavaScript Error objects
    if (error instanceof Error) {
        return error.message;
    }

    // Handle network errors
    if (error && typeof error === "object" && "name" in error) {
        const networkError = error as { name: string; message?: string };
        if (networkError.name === "NetworkError") {
            return "Network connection failed. Please check your internet connection.";
        }
        if (networkError.name === "AbortError") {
            return "Request was cancelled";
        }
    }

    // Handle string errors
    if (typeof error === "string") {
        return error;
    }

    // Fallback for unknown errors
    return "An unexpected error occurred";
}

function handleError(error: unknown) {
    const errorMessage = parseSupabaseError(error);

    // Log the full error for debugging
    console.error("Global query error:", error);

    // Show user-friendly error message
    toast.error(errorMessage);
}


export const globalQueryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            handleError(error);
        }
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            handleError(error);
        }
    })
})