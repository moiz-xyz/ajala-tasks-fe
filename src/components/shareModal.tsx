// src/components/ShareModal.tsx
import { useState } from "preact/hooks";
import type { JSX } from "preact";
import axios from "axios";

const ShareModal = ({
  docId,
  onClose,
}: {
  docId: string;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);

  const handleShare = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/docs/${docId}/share`, {
        email,
        role,
      });
      alert(`Shared successfully with ${email} as ${role}`);
      onClose();
    } catch (err) {
      alert("Failed to share document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Share Document</h3>
        <form onSubmit={handleShare}>
          <input
            type="email"
            placeholder="User's email"
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.currentTarget.value as any)}
          >
            <option value="viewer">Viewer (Read Only)</option>
            <option value="editor">Editor (Can Edit)</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Sharing..." : "Send Invite"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
