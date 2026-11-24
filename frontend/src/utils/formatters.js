const BACKEND_ORIGIN = 'http://127.0.0.1:8000';

export function formatCurrency(amount) {
  const numeric = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function extractApiError(error, fallbackMessage = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (!data) return { message: fallbackMessage, fieldErrors: {} };

  const fieldErrors = {};
  if (data.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        fieldErrors[key] = val.join(' ');
      } else if (typeof val === 'string') {
        fieldErrors[key] = val;
      }
    });
  }

  const nonField = fieldErrors.non_field_errors;
  return {
    message: nonField || data.detail || fallbackMessage,
    fieldErrors,
  };
}