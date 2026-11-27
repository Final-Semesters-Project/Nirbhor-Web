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

  // Clear any legacy/previous user info from storage to avoid session bleeding
  localStorage.removeItem("user_name_bn");
  localStorage.removeItem("user_name_en");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_phone");
  sessionStorage.removeItem("user_name_bn");
  sessionStorage.removeItem("user_name_en");
  sessionStorage.removeItem("user_name");
  sessionStorage.removeItem("user_phone");

  sessionStorage.removeItem("manual_logout");
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
// GET REFRESH TOKEN
// =====================================

export function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem("refresh_token") ||
    localStorage.getItem("refresh_token")
  );
}

// =====================================
// RESTORE SESSION FROM LOCAL STORAGE
// =====================================

export function restoreAuthSession() {
  if (typeof window === "undefined") {
    return false;
  }

  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (!accessToken || !refreshToken) {
    return false;
  }

  if (!sessionStorage.getItem("access_token")) {
    sessionStorage.setItem("access_token", accessToken);
  }
  if (!sessionStorage.getItem("refresh_token")) {
    sessionStorage.setItem("refresh_token", refreshToken);
  }
  if (!sessionStorage.getItem("token_type")) {
    sessionStorage.setItem("token_type", "bearer");
  }

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  if (role && !sessionStorage.getItem("role")) {
    sessionStorage.setItem("role", role);
  }
  if (userId && !sessionStorage.getItem("user_id")) {
    sessionStorage.setItem("user_id", userId);
  }

  return true;
}

// =====================================
// CHECK JWT EXPIRATION
// =====================================

export function isTokenExpired(token) {
  if (!token || typeof token !== "string") {
    return true;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return true;
    }
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(padded));
    if (payload?.exp && payload.exp * 1000 <= Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
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
// PAUSE SESSION ON LOGOUT (KEEP LOCALSTORAGE TOKENS)
// =====================================

export function pauseAuthSessionForLogout() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("token_type");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("user_id");
  sessionStorage.setItem("manual_logout", "1");
}

// =====================================
// CLEAR AUTHENTICATION SESSION
// =====================================

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("manual_logout");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("token_type");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("user_name_bn");
  sessionStorage.removeItem("user_name_en");
  sessionStorage.removeItem("user_name");
  sessionStorage.removeItem("user_phone");

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name_bn");
  localStorage.removeItem("user_name_en");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_phone");
}
