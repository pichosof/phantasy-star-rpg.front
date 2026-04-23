// suppress the findDOMNode error until the issue - https://github.com/ant-design/ant-design/issues/26136 - resolved

const consoleError = console.error.bind(console);
console.error = (errObj, ...args) => {
  if (import.meta.env.DEV && typeof errObj === 'string' && args.includes('findDOMNode')) {
    return;
  }
  consoleError(errObj, ...args);
};

export default {};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
export const UPLOAD_MAX_MB = Number(import.meta.env.VITE_UPLOAD_MAX_MB || 30);
