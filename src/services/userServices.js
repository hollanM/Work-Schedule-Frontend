import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/users");
  },
  get(id) {
    return apiClient.get(`/users/${id}`);
  },
  getDept(department) { //get all users within the same department
    return apiClient.get(`/users/department/${department}`);
  },
  getOCid(oc_id) { //get a single user with the requested employee id
    return apiClient.get(`/users/employee/${oc_id}`);
  },
  create(data) {
    return apiClient.post("/users", data);
  },
  update(id, data) {
    return apiClient.put(`/users/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/users/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/users`);
  },
};