import axios from "axios";
import { API_TIMEOUT_MS, BASE_URL } from "../config";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
