import axios from "axios";
import toast from 'react-hot-toast';

// Global Axios Settings
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.timeout = 10000;

axios.interceptors.response.use(
  (value) => Promise.resolve(value),
  (error) => {
    console.info('API response error', error.response.data);
    const errordetails = typeof (error.response.data.detail) === 'string' ?
      error.response.data.detail : error.response.data.detail[0]
    
    const errormsg = typeof (errordetails) === 'string' ? errordetails : errordetails.msg || errordetails.message || errordetails.error;

    toast.error(errormsg)
    return Promise.reject(error);
  }
);


const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};


export default http;

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
};
