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
  const [userRole, setUserRole] = useState<string | undefined>("viewer");
  const [requiredRole, setRequiredRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSocket(sc);

    if (id) {
      sc.emit("join-document", id);

      docService
        .getById(id)
        .then((res) => {
          setTitle(res.data.title || "");
          setContent(res.data.content || "");
          setUserRole(res.data.userRole || "viewer");
          if (res.data.requiredRole) setRequiredRole(res.data.requiredRole);
        })
        .catch((err) => {
          console.error("Error fetching doc", err);
        });
    }

    return () => {
      if (id) sc.emit("leave-document", id);
    };
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (newContent: string) => {
      setContent((prev) => (prev === newContent ? prev : newContent));
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket]);

  // FIX: Unlock editor if requiredRole is "viewer" (Public) OR if user is owner/editor
  const isReadOnly = requiredRole === "viewer" ? false : userRole === "viewer";

  const handleEditorChange = (value: string, _delta: any, source: string) => {
    setContent(value);
    if (socket && id && source === "user") {
      socket.emit("send-changes", { docId: id, content: value });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFileUpload = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const fileList = e.currentTarget.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== "string") return;
        setContent(result);
        if (socket && id)
          socket.emit("send-changes", { docId: id, content: result });
        if (!title && file.name) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      } catch (err) {
        console.error(err);
      } finally {
        if (e.currentTarget) e.currentTarget.value = "";
      }
    };
    reader.readAsText(file);
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

    if (isReadOnly && userRole !== "owner") return;

    setLoading(true);
    try {
      if (id) await docService.update(id, data);
      else await docService.create(data);
      alert("Document Saved!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Save failed.");
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
            width: "50%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          {id && (
            <button
              onClick={handleShare}
              style={{
                padding: "10px 20px",
                backgroundColor: copied ? "#059669" : "#f3f4f6",
                color: copied ? "white" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ Copied!" : "🔗 Share"}
            </button>
          )}

          {/* Show save button if user can edit */}
          {(!isReadOnly || userRole === "owner") && (
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
      </div>

      {/* ACCESS SETTINGS: Visible to Owner or if editing is allowed */}
      {(!isReadOnly || userRole === "owner") && (
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
              Who can edit?
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
              <option value="viewer">Everyone (Public)</option>
              <option value="editor">Only Editors (Restricted)</option>
              <option value="admin">Only Me (Private)</option>
            </select>
          </div>
        </div>
      )}

      {isReadOnly && userRole !== "owner" && (
        <div
          style={{
            color: "#ef4444",
            marginBottom: "10px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
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
