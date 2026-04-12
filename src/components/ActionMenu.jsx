import { useState, useEffect, useRef } from "react";

const ActionMenu = ({ onView, onEdit, onDelete, canModify }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          color: "var(--text-muted)",
          padding: "4px 8px",
          borderRadius: "6px",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-bg)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        ⋮
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            border: "1px solid var(--border)",
            minWidth: "130px",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {onView && (
            <button
              onClick={() => {
                setOpen(false);
                onView();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "10px 14px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text)",
                textAlign: "left",
                fontFamily: "DM Sans, sans-serif",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              View
            </button>
          )}

          {/* Corrected: Wrap multiple buttons in a fragment <> </> */}
          {canModify && (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text)",
                  textAlign: "left",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--danger)",
                  textAlign: "left",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
