import { useState } from "preact/hooks";
import type { JSX } from "preact";
import { useParams } from "react-router-dom";
import { docService } from "../service/api"; // Use your new service
import type { DocData } from "../service/api";

const PublicDocView = () => {
  const { shareId } = useParams<{ shareId: string }>();

  const [passcode, setPasscode] = useState("");
  const [doc, setDoc] = useState<DocData | null>(null);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    if (!shareId) return;

    setLoading(true);
    setError("");

    try {
      // Calling your centralized API service
      const res = await docService.verifyShare(shareId, passcode);
      setDoc(res.data);
      setIsLocked(false);
    } catch (err) {
      setError("Invalid Access Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          fontFamily: "sans-serif",
        }}
      >
        <h2>🔒 Private Document</h2>
        <p>This document is protected. Please enter the code to view.</p>
        <form onSubmit={handleUnlock}>
          <input
            type="password"
            onInput={(e) => setPasscode(e.currentTarget.value)}
            placeholder="Enter Code"
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{doc?.title}</h1>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: doc?.content || "" }} />
    </div>
  );
};

export default PublicDocView;
