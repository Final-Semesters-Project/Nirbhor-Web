// =====================================
// SAVE AUTHENTICATION SESSION
// =====================================

export function saveAuthSession(data) {
  if (typeof window === "undefined") {
    return;
  }

  if (!data?.access_token || !data?.refresh_token) {
    throw new Error(
      "Authentication tokens were not returned by the backend."
    );
  }

  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);
  sessionStorage.setItem("token_type", data.token_type || "bearer");
  if (data.role) sessionStorage.setItem("role", data.role);
  if (data.user_id) sessionStorage.setItem("user_id", data.user_id);

  // Also persist to localStorage for page refreshes & tab sync
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  if (data.role) localStorage.setItem("role", data.role);
  if (data.user_id) localStorage.setItem("user_id", data.user_id);
}

// =====================================
// GET AUTHENTICATION TOKEN
// =====================================

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token")
  );
}

// =====================================
// GET USER ROLE
// =====================================

export function getUserRole() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem("role") ||
    localStorage.getItem("role")
  );
}

// =====================================
// GET USER ID
// =====================================

export function getUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem("user_id") ||
    localStorage.getItem("user_id")
  );
}

// =====================================
// CLEAR AUTHENTICATION SESSION
// =====================================

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("token_type");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("user_id");

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
}
