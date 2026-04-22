const Loader = ({ size = "medium", fullPage = false }) => {
  const config = {
    small: { dim: "18px", thickness: "2px" },
    medium: { dim: "32px", thickness: "3px" },
    large: { dim: "48px", thickness: "4px" },
  };

  const { dim, thickness } = config[size] || config.medium;

  const spinner = (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: "50%",
        border: `${thickness} solid var(--primary-bg)`,
        borderTop: `${thickness} solid var(--primary)`,
        animation: "loader-spin 0.65s linear infinite",
        flexShrink: 0,
      }}
    />
  );

  return (
    <>
      <style>{`@keyframes loader-spin { to { transform: rotate(360deg); } }`}</style>
      {fullPage ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "280px",
            width: "100%",
          }}
        >
          {spinner}
        </div>
      ) : (
        spinner
      )}
    </>
  );
};

export default Loader;
