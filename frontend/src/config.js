import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 429) {
      alert('Bạn đang thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.');
    }
    return Promise.reject(err);
  }
);

export { API_BASE, SOCKET_URL };
