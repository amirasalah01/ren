import api from "./axios";

export async function getProperties(params = {}) {
  const response = await api.get("/properties/list/", { params });
  return response.data;
}

export async function getProperty(id) {
  const response = await api.get(`/properties/${id}/`);
  return response.data;
}

export async function createProperty(data) {
  const response = await api.post("/properties/list/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateProperty(id, data) {
  const response = await api.patch(`/properties/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteProperty(id) {
  const response = await api.delete(`/properties/${id}/`);
  return response.data;
}

export async function getMyProperties(params = {}) {
  const response = await api.get("/properties/my/", { params });
  return response.data;
}

// ---- Favorites ----

export async function getFavorites() {
  const response = await api.get("/properties/favorites/");
  return response.data;
}

export async function addFavorite(propertyId) {
  const response = await api.post("/properties/favorites/", { property: propertyId });
  return response.data;
}

export async function removeFavorite(favoriteId) {
  const response = await api.delete(`/properties/favorite/${favoriteId}/`);
  return response.data;
}

// ---- Reviews ----

export async function getReviews(propertyId) {
  const response = await api.get(`/properties/${propertyId}/reviews/`);
  return response.data;
}

export async function createReview(propertyId, data) {
  const response = await api.post(`/properties/${propertyId}/reviews/`, data);
  return response.data;
}

export async function deleteReview(reviewId) {
  const response = await api.delete(`/properties/review/${reviewId}/`);
  return response.data;
}

// ---- Property Images ----

export async function uploadPropertyImage(propertyId, imageFile, caption = "") {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("caption", caption);
  const response = await api.post(`/properties/${propertyId}/images/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deletePropertyImage(imageId) {
  const response = await api.delete(`/properties/images/${imageId}/`);
  return response.data;
}