import { useState, useEffect } from "preact/hooks";
import { docService, sc } from "../service/api";
import type { JSX } from "preact";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { Socket } from "socket.io-client";

const EditDoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [passcode, setPasscode] = useState("");
  const [userRole, setUserRole] = useState<string | undefined>("owner");
  const [requiredRole, setRequiredRole] = useState("viewer");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSocket(sc);

    if (id) {
      // Join the socket room for this specific document
      sc.emit("join-document", id);

      docService
        .getById(id)
        .then((res) => {
          setTitle(res.data.title || "");
          setContent(res.data.content || "");
          setUserRole(res.data.userRole || "owner");
          if (res.data.requiredRole) setRequiredRole(res.data.requiredRole);
        })
        .catch((err) => console.error("Error fetching doc", err));
    }

    return () => {
      if (id) sc.emit("leave-document", id);
    };
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handler = (newContent: string) => {
      // Use functional update to avoid infinite loops and hanging
      setContent((prev) => (prev === newContent ? prev : newContent));
    };

    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket]);

  const isReadOnly = userRole === "viewer";

  // Critical fix: use 'source' to prevent loops/hanging
  const handleEditorChange = (value: string, _delta: any, source: string) => {
    setContent(value);
    if (socket && id && source === "user") {
      socket.emit("send-changes", { docId: id, content: value });
    }
  };

  const handleFileUpload = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    // 1. Safely grab the file list
    const fileList = e.currentTarget.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const reader = new FileReader();

    // 2. Setup the load handler with error boundaries
    reader.onload = (event) => {
      try {
        const result = event.target?.result;

        // Ensure the result is actually a string before using it
        if (typeof result !== "string") {
          console.warn("File result is not a string.");
          return;
        }

        // 3. Update state and emit via socket
        setContent(result);

        if (socket && id) {
          socket.emit("send-changes", { docId: id, content: result });
        }

        // 4. Update title if it's currently empty
        if (!title && file.name) {
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          setTitle(fileName);
        }
      } catch (err) {
        console.error("Critical error in FileReader onload:", err);
      } finally {
        // 5. CRITICAL: Clear the input value so you can upload
        // the same file again immediately if needed
        if (e.currentTarget) e.currentTarget.value = "";
      }
    };

    // 6. Handle actual reading errors (e.g., file locked)
    reader.onerror = () => {
      console.error("FileReader failed to read the file.");
    };

    reader.readAsText(file); //
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    const data: any = {
      title: title || "Untitled",
      content,
      requiredRole,
      passcode,
      owner: userId,
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
      alert("Save failed. Check console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          disabled={isReadOnly}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
            setTitle(e.currentTarget.value)
          }
          style={{
            fontSize: "24px",
            width: "70%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />

        {!isReadOnly && (
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "10px 25px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Saving..." : "Save Document"}
          </button>
        )}
      </div>

      {!isReadOnly && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            alignItems: "center",
            backgroundColor: "#f9fafb",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <label
            style={{ cursor: "pointer", color: "#2563eb", fontWeight: "500" }}
          >
            📁 Import Text/MD
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>

          <div>
            <label style={{ fontSize: "14px", marginRight: "8px" }}>
              Access:
            </label>
            <select
              value={requiredRole}
              onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                setRequiredRole(e.currentTarget.value)
              }
              style={{
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="viewer">Public (Viewer)</option>
              <option value="editor">Restricted (Editor)</option>
              <option value="admin">Private (Admin)</option>
            </select>
          </div>
        </div>
      )}

      {isReadOnly && (
        <div
          style={{ color: "#6b7280", marginBottom: "10px", fontSize: "14px" }}
        >
          ℹ️ You are in View-Only mode
        </div>
      )}

      <div style={{ height: "500px", marginBottom: "50px" }}>
        <ReactQuill
          theme={isReadOnly ? "bubble" : "snow"}
          readOnly={isReadOnly}
          value={content}
          onChange={handleEditorChange}
          style={{ height: "100%", backgroundColor: "white" }}
        />
      </div>
    </div>
  );
};

export default EditDoc;
