import apiClient from "./services.js";

const clock_listServices = {
  getAll() {
    return apiClient.get("/clock_list");
  },
  get(id) {
    return apiClient.get(`/clock_list/${id}`);
  },
  create(data) {
    return apiClient.post("/clock_list", data);
  },
  update(id, data) {
    return apiClient.put(`/clock_list/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/clock_list/${id}`);
  },
  findAllForUser(userId) {
    return apiClient.get(`/clock_list/user/${userId}`);
  },
  findAllForDept(departmentId) {
    return apiClient.get(`/clock_list/department/${departmentId}`);
  },
};

export default clock_listServices;
