import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/notification_lists");
  },
  getAllForUser(userId) {
    return apiClient.get(`/notification_lists/userTut/${userId}`);
  },
  get(id) {
    return apiClient.get(`/notification_lists/${id}`);
  },
  create(data) {
    return apiClient.post("/notification_lists", data);
  },
  update(id, data) {
    return apiClient.put(`/notification_lists/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/notification_lists/${id}`);
  }
};

