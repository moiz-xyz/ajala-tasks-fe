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

export interface DocData {
  _id?: string;
  title: string;
  content: string;
  // Update this to handle populated owner data
  owner?: {
    _id: string;
    email: string;
  };
  requiredRole?: string;
  userRole?: string;
}

export interface SharePayload {
  email: string;
  role: "viewer" | "editor";
}

// Centralized API Calls
export const docService = {
  getByUser: (userId: string) =>
    api.get<DocData[]>(`/documents/user/${userId}`),

  // Get all documents for dashboard
  getAll: () => api.get<DocData[]>("/documents"),

  // Get single doc by ID (Private/Auth access)
  getById: (id: string) => api.get<DocData>(`/documents/${id}`),

  // Create new doc
  create: (data: DocData) => api.post<DocData>("/documents", data),

  // Update existing doc
  update: (id: string, data: DocData) =>
    api.put<DocData>(`/documents/${id}`, data),

  // Delete doc
  delete: (id: string) => api.delete(`/documents/${id}`),

  // Public/Shared Access (Verify passcode)
  verifyShare: (shareId: string, passcode: string) =>
    api.post<DocData>("/documents/verify-share", { shareId, passcode }),

  // Invite someone via email
  shareWithEmail: (id: string, payload: SharePayload) =>
    api.post(`/documents/${id}/share`, payload),
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login to get token and userId
  login: (credentials: any) => api.post("/auth/login", credentials),
};

export const sc = io(API_BASE_URL.replace("/api", "")); // Socket.IO client instance
