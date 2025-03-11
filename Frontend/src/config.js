require("dotenv").config();
const API_BASE_URL = process.env.VITE_BACKEND_URL || "http://localhost:5000";
export default API_BASE_URL;
