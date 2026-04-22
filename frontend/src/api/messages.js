import api from "./axios";

export async function getInbox() {
  const response = await api.get("/messages/inbox/");
  return response.data;
}

export async function getSent() {
  const response = await api.get("/messages/sent/");
  return response.data;
}

export async function sendMessage(data) {
  // data: { receiver, subject, body, property (optional) }
  const response = await api.post("/messages/send/", data);
  return response.data;
}

export async function markAsRead(messageId) {
  const response = await api.patch(`/messages/${messageId}/read/`);
  return response.data;
}

export async function deleteMessage(messageId) {
  const response = await api.delete(`/messages/${messageId}/`);
  return response.data;
}
