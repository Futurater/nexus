// Backend API base URL - always use localhost:8000 for development
const server = "http://localhost:8000";

// Check if production environment
const IS_PROD = window.location.hostname !== 'localhost';

// Export configuration
export default server;
export { IS_PROD };
