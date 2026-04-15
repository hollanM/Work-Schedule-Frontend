import apiClient from "./services.js";

const clock_in_outServices = {
  getAll() {
    return apiClient.get("/clock_in_out");
  },
  get(id) {
    return apiClient.get(`/clock_in_out/${id}`);
  },
  create(data) {
    return apiClient.post("/clock_in_out", data);
  },
  update(id, data) {
    return apiClient.put(`/clock_in_out/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/clock_in_out/${id}`);
  },
  findAllForUser(userId) {
    return apiClient.get(`/clock_in_out/userTut/${userId}`);
  },
  findAllForDept(departmentId) {
    return apiClient.get(`/clock_in_out/department/${departmentId}`);
  },
};

export default clock_in_outServices;
