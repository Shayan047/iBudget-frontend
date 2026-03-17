const DeleteModal = ({ onClose, onConfirm, loading }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(30, 27, 75, 0.3)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{ width: "100%", maxWidth: "360px", padding: "32px", textAlign: "center" }}
      >
        {/* Icon */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: "#fef2f2", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
        }}>
          <span style={{ fontSize: "22px" }}>🗑️</span>
        </div>

        <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px" }}>
          Delete Entry
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "10px 20px", borderRadius: "10px",
              background: "var(--danger)", color: "white", border: "none",
              fontFamily: "DM Sans, sans-serif", fontSize: "14px",
              fontWeight: "500", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;