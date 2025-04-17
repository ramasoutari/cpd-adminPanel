import axios from "axios";
import { HOST_API } from "../constants";

// Instance
export const axiosInstance = axios.create({
  baseURL: HOST_API,
});

// Interceptors
axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    throw error?.response?.data;
  }
);

export default axiosInstance;
