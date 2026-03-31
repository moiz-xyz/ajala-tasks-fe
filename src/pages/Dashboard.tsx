import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { docService } from "../service/api";
import type { DocData } from "../service/api";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDocs = async () => {
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        // Fetches docs owned by user OR public (viewer) docs
        const res = await docService.getByUser(userId);
        setDocuments(res.data);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [navigate, userId]);

  const handleCreateNew = () => navigate("/edit");

  // Logic to calculate stats
  const myDocs = documents.filter((doc) => doc.owner?._id === userId);
  const sharedDocs = documents.filter((doc) => doc.owner?._id !== userId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your documents and shared collaborations.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
        >
          <span className="text-2xl leading-none">+</span> New Document
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            My Documents
          </p>
          <p className="mt-2 text-4xl font-black text-blue-600">
            {myDocs.length}
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Shared With Me
          </p>
          <p className="mt-2 text-4xl font-black text-green-500">
            {sharedDocs.length}
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Accessible
          </p>
          <p className="mt-2 text-4xl font-black text-gray-800">
            {documents.length}
          </p>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Documents</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const isOwner = doc.owner?._id === userId;

              return (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/edit/${doc._id}`)}
                  className="group relative flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-400 cursor-pointer transition-all duration-300"
                >
                  {/* Ownership Badge */}
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      isOwner
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {isOwner ? "Owner" : "Shared"}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 truncate pr-12">
                      {doc.title || "Untitled Document"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium italic">
                      {isOwner ? "You" : doc.owner?.email || "Collaborator"}
                    </p>
                    <p className="text-sm text-gray-500 mt-4 line-clamp-3 leading-relaxed">
                      {doc.content?.replace(/<[^>]*>/g, "").substring(0, 120) ||
                        "Empty document..."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>ID: {doc._id?.substring(0, 8)}</span>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-20 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-white shadow-inner">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-gray-500 font-medium text-lg">
              No documents found.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Create a document or have someone share a public link with you.
            </p>
            <button
              onClick={handleCreateNew}
              className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
            >
              Get started by creating your first document →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
