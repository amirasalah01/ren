import api from "./axios";

export async function getProperties() {
  const response = await api.get("/properties/");
  return response.data;
}

export async function getProperty(id) {
  const response = await api.get(`/properties/${id}/`);
  return response.data;
}

export async function createProperty(data) {
  const response = await api.post("/properties/", data);
  return response.data;
}

export async function deleteProperty(id) {
  const response = await api.delete(`/properties/${id}/`);
  return response.data;
}