import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/shift_task_lists");
  },
  get(id) {
    return apiClient.get(`/shift_task_lists/${id}`);
  },

  create(data) {
    return apiClient.post("/shift_task_lists", data);
  },
  update(id, data) {
    return apiClient.put(`/shift_task_lists/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/shift_task_lists/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/shift_task_lists`);
  },
};