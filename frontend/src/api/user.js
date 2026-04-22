import api from "./axios";

export async function getProfile() {
  const response = await api.get("/auth/profile/");
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.put("/auth/profile/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getDashboard() {
  const response = await api.get("/auth/dashboard/");
  return response.data;
}
