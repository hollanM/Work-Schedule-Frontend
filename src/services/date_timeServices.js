import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/date_times");
  },
  get(id) {
    return apiClient.get(`/date_times/${id}`);
  },

  create(data) {
    return apiClient.post("/date_times", data);
  },
  update(id, data) {
    return apiClient.put(`/date_times/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/date_times/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/date_times`);
  },
};