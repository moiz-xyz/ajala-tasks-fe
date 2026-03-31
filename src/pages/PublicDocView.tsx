import { useState } from "preact/hooks"; // Use preact hooks
import type { JSX } from "preact"; // Type-only import for JSX namespace
import { useParams } from "react-router-dom";
import axios from "axios";

interface DocumentData {
  title: string;
  content: string;
  shareId: string;
}

const PublicDocView = () => {
  const { shareId } = useParams<{ shareId: string }>();

  const [passcode, setPasscode] = useState<string>("");
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Fix: Use JSX.TargetedEvent for Preact to handle 'currentTarget' correctly
  const handleUnlock = async (
    e: JSX.TargetedEvent<HTMLFormElement, Event>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post<DocumentData>(
        `http://localhost:5000/api/docs/verify-share`,
        {
          shareId,
          passcode,
        },
      );

      setDoc(res.data);
      setIsLocked(false);
    } catch (err) {
      setError("Invalid Access Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fix: Use JSX.TargetedEvent for the input change
  const handleInputChange = (
    e: JSX.TargetedEvent<HTMLInputElement, Event>,
  ): void => {
    setPasscode(e.currentTarget.value); // Use currentTarget in Preact
  };

  if (isLocked) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔒 Private Document</h2>
        <form onSubmit={handleUnlock}>
          <input
            type="password"
            placeholder="Enter Access Code"
            value={passcode}
            onInput={handleInputChange} // Preact prefers onInput over onChange
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button type="submit" disabled={loading || !passcode}>
            {loading ? "Verifying..." : "Unlock"}
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
