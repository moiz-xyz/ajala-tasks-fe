// src/components/doc.tsx (Partial logic)
const DocComponent = ({ docData }: { docData: any }) => {
  const handleShare = () => {
    // Construct the URL using your current domain
    const shareUrl = `${window.location.origin}/view/${docData.shareId}`;

    navigator.clipboard.writeText(shareUrl);
    alert("Shareable link copied to clipboard!");
  };

  return (
    <div>
      <h2>{docData.title}</h2>
      <button
        onClick={handleShare}
        style={{ backgroundColor: "#4CAF50", color: "white" }}
      >
        Copy Share Link
      </button>
      {/* ... existing doc content ... */}
    </div>
  );
};

export default DocComponent;
