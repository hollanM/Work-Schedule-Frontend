import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/employees");
  },
  get(id) {
    return apiClient.get(`/employees/${id}`);
  },
  create(data) {
    return apiClient.post("/employees", data);
  },
  update(id, data) {
    return apiClient.put(`/employees/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/employees/${id}`);
  },
};

