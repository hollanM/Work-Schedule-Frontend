import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/tasks");
  },
  get(id) {
    return apiClient.get(`/tasks/${id}`);
  },

  create(data) {
    return apiClient.post("/tasks", data);
  },
  update(id, data) {
    return apiClient.put(`/tasks/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/tasks/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/tasks`);
  },
};