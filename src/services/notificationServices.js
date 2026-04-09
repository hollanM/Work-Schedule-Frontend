import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/notifications");
  },
  getAllForList(listId) {
    return apiClient.get(`/notifications/list/${listId}`);
  },
  get(id) {
    return apiClient.get(`/notifications/${id}`);
  },
  create(data) {
    return apiClient.post("/notifications", data);
  },
  update(id, data) {
    return apiClient.put(`/notifications/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/notifications/${id}`);
  }
};

