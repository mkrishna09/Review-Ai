import axios from "./axios";

const api = {
  get: <T>(url: string) => axios.get<T>(url).then((res) => res.data),

  post: <T>(url: string, data?: unknown) =>
    axios.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: unknown) =>
    axios.put<T>(url, data).then((res) => res.data),

  delete: <T>(url: string) => axios.delete<T>(url).then((res) => res.data),
};

export default api;
