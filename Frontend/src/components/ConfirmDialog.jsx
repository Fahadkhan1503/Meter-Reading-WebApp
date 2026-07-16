import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-paper border border-line rounded-[20px] p-6 max-w-md w-full shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-soft hover:text-ink transition"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger-light/20 text-danger mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-ink text-center mb-2">
          {title || 'Confirm Delete'}
        </h3>

        {/* Message */}
        <p className="text-sm text-ink-soft text-center mb-6">
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-surface border border-line text-ink-soft font-medium rounded-[10px] py-2.5 hover:bg-paper transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-danger text-white font-medium rounded-[10px] py-2.5 hover:bg-danger-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;