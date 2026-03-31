import { useState, useEffect } from "preact/hooks";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the editor's theme
import axios from "axios";

const EditDoc = () => {
  const { id } = useParams<{ id: string }>(); // MongoDB _id
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing doc data if editing
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/docs/${id}`).then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setPasscode(res.data.passcode || "");
      });
    }
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    const docData = { title, content, passcode };

    try {
      if (id) {
        // Update existing
        await axios.put(`http://localhost:5000/api/docs/${id}`, docData);
      } else {
        // Create new
        await axios.post(`http://localhost:5000/api/docs`, docData);
      }
      alert("Document Saved!");
      navigate("/"); // Go back to dashboard
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
          onInput={(e) => setTitle(e.currentTarget.value)}
          style={{
            fontSize: "24px",
            width: "70%",
            padding: "10px",
            border: "1px solid #ddd",
          }}
        />
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
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Set Access Passcode (Optional): </label>
        <input
          type="text"
          placeholder="e.g. 1234"
          value={passcode}
          onInput={(e) => setPasscode(e.currentTarget.value)}
          style={{ padding: "5px", marginLeft: "10px" }}
        />
      </div>

      <div style={{ height: "400px", marginBottom: "50px" }}>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default EditDoc;
