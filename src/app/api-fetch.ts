import axios from "axios";
import toast from "react-hot-toast";
 
type methods = 'GET' | "POST" | "PUT" | "DELETE"
 
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 100000,
});
 
instance.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (!error.response) {
      toast.error('Network error occurred. Please check your internet connection.');
    }
    return Promise.reject(error);
  }
);
 
export const ApiFetchReq = (methods: methods, url: string, body?: any) => {
  const token = localStorage.getItem('token');
 
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": 'application/json',
  };
  const config = {
    method: methods,
    url,
    data: body,
    headers,
  };
 
  return instance(config)
    .then((res: any) => {
      return { response: res, error: undefined };
    })
    .catch((err: any) => {
      // Handle other errors here, if needed
      console.log(err)
      return { response: undefined, error: err }
      // throw err; // Re-throw the error to propagate it to the calling function
    });
};