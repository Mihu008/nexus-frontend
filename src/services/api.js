import axios from 'axios'

// Construct base Axios client pointing to Vite proxy endpoint
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Centralized Response and Error interceptors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error] Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export default api
