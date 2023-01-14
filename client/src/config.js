export const API_URL = (process.env.NODE_ENV === 'production') ? '/api' : 'http://localhost:8001/api';
export const IMAGES_URL = (process.env.NODE_ENV === 'production') ? '/uploads' : 'http://localhost:8001/uploads';
