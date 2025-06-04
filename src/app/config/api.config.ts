// API Configuration
export const API_CONFIG = {

  BASE_URL: 'https://10.128.10.82:8443',
  
  // Endpoints
  ENDPOINTS: {
    LOGIN: '/ips/management/apps/sve/security/login',

  }
};


export function getFullUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}


export const API_URLS = {
  LOGIN: getFullUrl(API_CONFIG.ENDPOINTS.LOGIN),
}; 