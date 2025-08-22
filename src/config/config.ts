// suppress the findDOMNode error until the issue - https://github.com/ant-design/ant-design/issues/26136 - resolved

const consoleError = console.error.bind(console);
console.error = (errObj, ...args) => {
  if (process.env.NODE_ENV === 'development' && typeof errObj === 'string' && args.includes('findDOMNode')) {
    return;
  }
  consoleError(errObj, ...args);
};

export default {};

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3010';
export const UPLOAD_MAX_MB = Number(process.env.REACT_APP_UPLOAD_MAX_MB || 30);
