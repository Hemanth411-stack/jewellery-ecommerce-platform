const active = new Set();
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

export const isOperationPending = () => active.size > 0;
export const subscribeToOperations = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const beginOperation = () => {
  const operation = Symbol("operation");
  active.add(operation);
  notify();
  return () => {
    if (active.delete(operation)) notify();
  };
};

export const trackApiOperations = (client) => {
  client.interceptors.request.use((config) => {
    if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
      config.finishOperation = beginOperation();
    }
    return config;
  }, undefined, { synchronous: true });
  client.interceptors.response.use((response) => {
    response.config.finishOperation?.();
    return response;
  }, (error) => {
    error.config?.finishOperation?.();
    return Promise.reject(error);
  });
};
