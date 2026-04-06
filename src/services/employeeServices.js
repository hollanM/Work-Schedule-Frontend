import apiClient from "./services.js";

export default {
  getAll() {
    let response = apiClient.get("/employees");
    console.log(response);
    return apiClient.get(response);
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

