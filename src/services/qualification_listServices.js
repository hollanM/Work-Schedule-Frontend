import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/qualification_lists");
  },
  get(id) {
    return apiClient.get(`/qualification_lists/${id}`);
  },

  create(data) {
    return apiClient.post("/qualification_lists", data);
  },
  update(id, data) {
    return apiClient.put(`/qualification_lists/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/qualification_lists/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/qualification_lists`);
  },
};