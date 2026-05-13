/**
 * Purpose: Presents a reusable confirmation dialog for destructive and high-impact admin actions.
 */
import PropTypes from "prop-types";

const ConfirmModal = ({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="nexus-card w-full max-w-md p-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-textSecondary">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="secondary-button px-4" onClick={onCancel}>Cancel</button>
          <button type="button" className="primary-button px-4" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmModal;
