import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:5000/api";

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types for your data
export interface DocData {
  _id?: string;
  title: string;
  content: string;
  passcode?: string;
  shareId?: string;
  userRole?: "owner" | "editor" | "viewer";
}

export interface SharePayload {
  email: string;
  role: "viewer" | "editor";
}

// Centralized API Calls
export const docService = {
  // Get all documents for dashboard
  getAll: () => api.get<DocData[]>("/docs"),

  // Get single doc by ID (Private/Auth access)
  getById: (id: string) => api.get<DocData>(`/docs/${id}`),

  // Create new doc
  create: (data: DocData) => api.post<DocData>("/docs", data),

  // Update existing doc
  update: (id: string, data: DocData) => api.put<DocData>(`/docs/${id}`, data),

  // Delete doc
  delete: (id: string) => api.delete(`/docs/${id}`),

  // Public/Shared Access (Verify passcode)
  verifyShare: (shareId: string, passcode: string) =>
    api.post<DocData>("/docs/verify-share", { shareId, passcode }),

  // Invite someone via email
  shareWithEmail: (id: string, payload: SharePayload) =>
    api.post(`/docs/${id}/share`, payload),
};

export const sc = io(API_BASE_URL.replace("/api", "")); // Socket.IO client instance
