import { useState, useEffect } from "preact/hooks";
import { docService, sc } from "../service/api";
import type { JSX } from "preact"; // For strict typing
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css"; // Required for viewer mode
import { io, Socket } from "socket.io-client";

// Define the shape of your document data
interface DocResponse {
  title: string;
  content: string;
  passcode?: string;
  userRole?: "owner" | "editor" | "viewer";
}

const EditDoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [passcode, setPasscode] = useState("");
  const [userRole, setUserRole] = useState<string | undefined>("owner"); // Track role
  const [loading, setLoading] = useState(false);
  const [requiredRole, setRequiredRole] = useState("viewer");

  useEffect(() => {
    setSocket(sc);
    if (id) {
      docService
        .getById(id)
        .then((res) => {
          setTitle(res.data.title);
          setContent(res.data.content);
          setUserRole(res.data.userRole);
        })
        .catch((err) => console.error("Error fetching doc", err));
    }
    return () => sc.disconnect();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (newContent: string) => {
      setContent(newContent); // Update your editor state
    };
    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [socket]);

  // Logic: Check if user is only a viewer
  const isReadOnly = userRole === "viewer";

  const handleEditorChange = (value: string) => {
    setContent(value);
    if (socket && id) {
      socket.emit("send-changes", { docId: id, content: value });
    }
  };

  const handleSave = async () => {
    // Map frontend state to backend expected fields
    const data = {
      title,
      content,
      requiredRole, // Matches backend: "viewer", "editor", or "admin"
      passcode, // Keep if your model supports both
    };

    if (isReadOnly) return;
    setLoading(true);

    try {
      if (id) {
        await docService.update(id, data);
      } else {
        await docService.create(data);
      }
      alert("Document Saved!");
      navigate("/");
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          disabled={isReadOnly} // Disable for viewers
          onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
            setTitle(e.currentTarget.value)
          }
          style={{
            fontSize: "24px",
            width: "70%",
            padding: "10px",
            border: "1px solid #ddd",
          }}
        />

        {!isReadOnly && ( // Hide Save button for viewers
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "10px 25px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Saving..." : "Save Document"}
          </button>
        )}
      </div>

      {!isReadOnly && ( // Hide passcode settings for viewers
        <div style={{ marginBottom: "20px" }}>
          <label>Set Access Passcode (Optional): </label>
          <input
            type="text"
            placeholder="e.g. 1234"
            value={passcode}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              setPasscode(e.currentTarget.value)
            }
            style={{ padding: "5px", marginLeft: "10px" }}
          />
        </div>
      )}

      {isReadOnly && (
        <div style={{ color: "#666", marginBottom: "10px" }}>
          ℹ️ You are in View-Only mode
        </div>
      )}

      <div style={{ height: "400px", marginBottom: "50px" }}>
        <ReactQuill
          theme={isReadOnly ? "bubble" : "snow"} // Bubble theme looks better for viewing
          readOnly={isReadOnly} // This is the core fix for the editor
          value={content}
          onChange={handleEditorChange}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default EditDoc;
