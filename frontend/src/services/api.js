import axios from 'axios';

const API_URL = 'https://api.kayaliksigorta.com/api/v1/';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (username, password, company_code) => {
    return api.post('login/', { username, password, company_code });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Company services
export const companyService = {
  getAll: () => api.get('companies/'),
  getById: (id) => api.get(`companies/${id}/`),
  create: (data) => api.post('companies/', data),
  update: (id, data) => api.put(`companies/${id}/`, data),
  delete: (id) => api.delete(`companies/${id}/`),
  getUsers: (id) => api.get(`companies/${id}/users/`),
  getInsuranceItems: (id) => api.get(`companies/${id}/insurance_items/`),
};

// Company User services
export const companyUserService = {
  getAll: () => api.get('company-users/'),
  getById: (id) => api.get(`company-users/${id}/`),
  create: (data) => api.post('company-users/', data),
  update: (id, data) => api.put(`company-users/${id}/`, data),
  delete: (id) => api.delete(`company-users/${id}/`),
  getAdmins: () => api.get('company-users/admins/'),
  getRoles: (id) => api.get(`company-users/${id}/roles/`),
  addRole: (id, role_id) => api.post(`company-users/${id}/add_role/`, { role_id }),
  removeRole: (id, role_id) => api.post(`company-users/${id}/remove_role/`, { role_id }),
  checkPermission: (id, query_type) => api.get(`company-users/${id}/check_permission/?query_type=${query_type}`),
};

// Insurance Company services
export const insuranceCompanyService = {
  getAll: () => api.get('insurance-companies/'),
  getById: (id) => api.get(`insurance-companies/${id}/`),
  create: (data) => api.post('insurance-companies/', data),
  update: (id, data) => api.put(`insurance-companies/${id}/`, data),
  delete: (id) => api.delete(`insurance-companies/${id}/`),
  getItems: (id) => api.get(`insurance-companies/${id}/items/`),
};

// Insurance Company Item services
export const insuranceCompanyItemService = {
  getAll: () => api.get('insurance-company-items/'),
  getById: (id) => api.get(`insurance-company-items/${id}/`),
  create: (data) => api.post('insurance-company-items/', data),
  update: (id, data) => api.put(`insurance-company-items/${id}/`, data),
  delete: (id) => api.delete(`insurance-company-items/${id}/`),
  bulkUpdatePartage: (data) => api.post('insurance-company-items/bulk_update_partage/', data),
  updatePartageOnly: (id, partage_id) => api.patch(`insurance-company-items/${id}/update_partage_only/`, { partage: partage_id }),
  getActiveItems: () => api.get('insurance-company-items/active_items/'),
  getCarQueryItems: () => api.get('insurance-company-items/car_query_items/'),
  getByQueryType: (query_type) => api.get(`insurance-company-items/by_query_type/?query_type=${query_type}`),
  getByPartage: (partage_id) => api.get(`insurance-company-items/by_partage/?partage_id=${partage_id}`),
  getSamePartageCompanies: (id) => api.get(`insurance-company-items/${id}/same_partage_companies/`),
  getSameInsuranceCompanyItems: (id) => api.get(`insurance-company-items/${id}/same_insurance_company_items/`),
  getByPartageAndInsuranceCompany: (partage_id, insurance_company_id) => 
    api.get(`insurance-company-items/by_partage_and_insurance_company/?partage_id=${partage_id}&insurance_company_id=${insurance_company_id}`),
  addQueryType: (id, query_type_id) => api.post(`insurance-company-items/${id}/add_query_type/`, { query_type_id }),
  removeQueryType: (id, query_type_id) => api.post(`insurance-company-items/${id}/remove_query_type/`, { query_type_id }),
};

// Role services
export const roleService = {
  getAll: () => api.get('roles/'),
  getById: (id) => api.get(`roles/${id}/`),
  create: (data) => api.post('roles/', data),
  update: (id, data) => api.put(`roles/${id}/`, data),
  delete: (id) => api.delete(`roles/${id}/`),
  getPermissions: (id) => api.get(`roles/${id}/permissions/`),
};

// Query Type services
export const queryTypeService = {
  getAll: () => api.get('query-types/'),
  getById: (id) => api.get(`query-types/${id}/`),
  create: (data) => api.post('query-types/', data),
  update: (id, data) => api.put(`query-types/${id}/`, data),
  delete: (id) => api.delete(`query-types/${id}/`),
};

// Role Permission services
export const rolePermissionService = {
  getAll: () => api.get('role-permissions/'),
  getById: (id) => api.get(`role-permissions/${id}/`),
  create: (data) => api.post('role-permissions/', data),
  update: (id, data) => api.put(`role-permissions/${id}/`, data),
  delete: (id) => api.delete(`role-permissions/${id}/`),
  getByRole: (role_id) => api.get(`role-permissions/by_role/?role_id=${role_id}`),
  getByQueryType: (query_type_id) => api.get(`role-permissions/by_query_type/?query_type_id=${query_type_id}`),
};

// Partage services
export const partageService = {
  getAll: () => api.get('partages/'),
  getById: (id) => api.get(`partages/${id}/`),
  create: (data) => api.post('partages/', data),
  update: (id, data) => api.put(`partages/${id}/`, data),
  delete: (id) => api.delete(`partages/${id}/`),
  getRelatedCompanies: (id) => api.get(`partages/${id}/related_companies/`),
};

export default api; 