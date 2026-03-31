import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { docService } from "../service/api"; // Adjust path as needed
import type { DocData } from "../service/api"; // Adjust path as needed

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyDocs = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const res = await docService.getByUser(userId);
        setDocuments(res.data);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyDocs();
  }, [navigate]);

  const handleCreateNew = () => navigate("/edit");

  return (
    <div className="space-y-6 p-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here is your overview.</p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
        >
          <span className="text-xl">+</span> New Document
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">
            Total Docs
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {documents.length}
          </p>
        </div>
        {/* Placeholder for other stats */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">
            Shared Docs
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">
            Recent Edits
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {documents.length > 0 ? 1 : 0}
          </p>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Loading your documents...
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => navigate(`/edit/${doc._id}`)}
              className="group p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all"
            >
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 truncate">
                {doc.title || "Untitled Document"}
              </h3>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {doc.content?.replace(/<[^>]*>/g, "").substring(0, 80) ||
                  "No content..."}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                <span>ID: {doc._id?.substring(0, 8)}</span>
                <span className="text-blue-500 group-hover:underline">
                  Open Editor →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
          <p className="text-gray-500 mb-4">
            You haven't created any documents yet.
          </p>
          <button
            onClick={handleCreateNew}
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first document now →
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
