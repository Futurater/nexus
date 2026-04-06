// Backend API base URL
const server = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Check if production environment
const IS_PROD = window.location.hostname !== 'localhost';

// Export configuration
export default server;
export { IS_PROD };
