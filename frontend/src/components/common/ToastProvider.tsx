import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import Toast, {
    type ToastMessage,
    type ToastType,
} from "./Toast";

interface ToastContextValue {
    showToast: (
        message: string,
        type?: ToastType,
    ) => void;
}

const ToastContext =
    createContext<
        ToastContextValue | undefined
    >(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

function ToastProvider({
                           children,
                       }: ToastProviderProps) {
    const [toasts, setToasts] =
        useState<ToastMessage[]>([]);

    /*
     * =========================================
     * REMOVE TOAST
     * =========================================
     */
    const removeToast = useCallback(
        (id: number) => {
            setToasts((current) =>
                current.filter(
                    (toast) => toast.id !== id,
                ),
            );
        },
        [],
    );

    /*
     * =========================================
     * SHOW TOAST
     * =========================================
     */
    const showToast = useCallback(
        (
            message: string,
            type: ToastType = "info",
        ) => {
            const id =
                Date.now() + Math.random();

            setToasts((current) => [
                ...current,
                {
                    id,
                    message,
                    type,
                },
            ]);

            /*
             * Automatically remove the toast
             * after four seconds.
             */
            window.setTimeout(() => {
                removeToast(id);
            }, 4000);
        },
        [removeToast],
    );

    /*
     * =========================================
     * GLOBAL API ERROR LISTENER
     * =========================================
     *
     * api.ts dispatches:
     *
     * pulse:api-error
     *
     * This provider listens for that event
     * and displays the appropriate toast.
     */
    useEffect(() => {
        function handleApiError(
            event: Event,
        ) {
            const customEvent =
                event as CustomEvent<{
                    type: ToastType;
                    message: string;
                }>;

            const detail =
                customEvent.detail;

            if (!detail) {
                return;
            }

            showToast(
                detail.message,
                detail.type,
            );
        }

        window.addEventListener(
            "pulse:api-error",
            handleApiError,
        );

        return () => {
            window.removeEventListener(
                "pulse:api-error",
                handleApiError,
            );
        };
    }, [showToast]);

    /*
     * =========================================
     * CONTEXT VALUE
     * =========================================
     */
    const value = useMemo(
        () => ({
            showToast,
        }),
        [showToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div
                className="toast-container"
                aria-live="polite"
                aria-atomic="true"
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

/*
 * =========================================
 * useToast HOOK
 * =========================================
 */
export function useToast(): ToastContextValue {
    const context =
        useContext(ToastContext);

    if (!context) {
        throw new Error(
            "useToast must be used inside ToastProvider",
        );
    }

    return context;
}

export default ToastProvider;