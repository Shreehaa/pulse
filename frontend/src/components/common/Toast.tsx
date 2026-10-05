import {
    CheckCircle2,
    Info,
    TriangleAlert,
    X,
    XCircle,
} from "lucide-react";

export type ToastType =
    | "success"
    | "error"
    | "warning"
    | "info";

export interface ToastMessage {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: number) => void;
}

function Toast({
                   toast,
                   onClose,
               }: ToastProps) {
    const icons = {
        success: <CheckCircle2 size={18} />,
        error: <XCircle size={18} />,
        warning: <TriangleAlert size={18} />,
        info: <Info size={18} />,
    };

    return (
        <div
            className={`toast toast-${toast.type}`}
            role="alert"
        >
            <div className="toast-icon">
                {icons[toast.type]}
            </div>

            <div className="toast-message">
                {toast.message}
            </div>

            <button
                type="button"
                className="toast-close"
                onClick={() => onClose(toast.id)}
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export default Toast;