import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/weekly_schedules");
  },
  get(id) {
    return apiClient.get(`/weekly_schedules/${id}`);
  },
   getForUser(id) {
    return apiClient.get(`/weekly_schedules/users/${id}`);
  },
  create(data) {
    return apiClient.post("/weekly_schedules", data);
  },
  update(id, data) {
    return apiClient.put(`/weekly_schedules/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/weekly_schedules/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/weekly_schedules`);
  },

  saveTemplate(data) {
    return apiClient.post("/weekly_schedules/template/save", data);
  },
  applyTemplate(data) {
    return apiClient.post("/weekly_schedules/template/apply", data);
  },
};