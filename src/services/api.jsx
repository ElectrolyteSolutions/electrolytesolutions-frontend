import axios from 'axios';

const API = axios.create({ baseURL: 'http://192.168.1.8:5000/api/products' });

export const fetchProducts = () => API.get('/');
export const createProduct = (data) => API.post('/', data);
export const updateProduct = (id, data) => API.put(`/${id}`, data);
export const deleteProduct = (id) => API.delete(`/${id}`);