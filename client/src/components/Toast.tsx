import { useToastStore, ToastType } from '../store/useToastStore';
import clsx from 'clsx';
import './Toast.css';

const icons: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={clsx('toast', `toast-${toast.type}`)}>
                    <span className="material-symbols-outlined icon">
                        {icons[toast.type]}
                    </span>
                    <p className="toast-message">{toast.message}</p>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
                    </button>
                </div>
            ))}
        </div>
    );
};
