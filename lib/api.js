const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://nirbhor-backend-6yuf.onrender.com/api/v1";
const STAGING_KEY =
  process.env.NEXT_PUBLIC_STAGING_KEY || "apikeytoidentifyiftherequestiscomingfromfrontendteam";

// =====================================
// GET CURRENT LANGUAGE
// =====================================
export function getCurrentLanguage() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("nirbhor_lang");
    if (saved === "bn" || saved === "en") {
      return saved;
    }
  }
  return "bn"; // default to Bengali
}

// =====================================
// BASE API REQUEST FUNCTION
// =====================================
export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    accessToken,
    language,
    headers = {},
  } = {}
) {
  // Check backend URL
  if (!API_BASE_URL) {
    throw new Error("Backend API URL is not configured.");
  }

  // Determine active language
  const activeLang = language || getCurrentLanguage();

  // Prepare request headers
  const requestHeaders = {
    Accept: "application/json",
    "Accept-Language": activeLang,
    ...headers,
  };

  // Add staging key if configured
  if (STAGING_KEY) {
    requestHeaders["X-Staging-Key"] = STAGING_KEY;
  }

  // Add access token if provided
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  // Detect request body types
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const isUrlEncoded =
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;

  // Prepare request body
  let requestBody;

  if (isFormData) {
    requestBody = body;
  } else if (isUrlEncoded) {
    requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    requestBody = body.toString();
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  // Ensure endpoint starts with slash if not present
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Send request
  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
    credentials: "same-origin",
    cache: "no-store",
  });

  // Read response
  const responseText = await response.text();
  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  // Handle errors
  if (!response.ok) {
    let errorMessage = "";

    const detail = responseData?.detail;
    if (Array.isArray(detail)) {
      errorMessage = detail
        .map((item) => (typeof item === "string" ? item : item.msg || JSON.stringify(item)))
        .join(". ");
    } else if (typeof detail === "string") {
      errorMessage = detail;
    } else if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (typeof responseData === "string") {
      errorMessage = responseData;
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}

// =====================================
// AUTHENTICATION API FUNCTIONS
// =====================================

/**
 * Login with phone number and password (OAuth2 Form / URL Encoded)
 * Matches Screenshots 3 & 4: POST /api/v1/auth/login
 */
export async function loginUser({ username, password }) {
  const formParams = new URLSearchParams();
  formParams.append("username", username.trim());
  formParams.append("password", password);

  return await apiRequest("/auth/login", {
    method: "POST",
    body: formParams,
  });
}

/**
 * Register a new provider account
 * Matches Screenshots 1 & 2: POST /api/v1/auth/register/provider
 */
export async function registerProviderAccount(data) {
  const payload = {
    name_en: data.name_en.trim(),
    name_bn: data.name_bn.trim(),
    phone: data.phone.trim(),
    password: data.password,
    preferred_lang: data.preferred_lang || getCurrentLanguage(),
    skill_ids: data.skill_ids,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    working_radius_km: Number(data.working_radius_km),
    has_smartphone: Boolean(data.has_smartphone),
    base_address: data.base_address ? data.base_address.trim() : null,
  };

  return await apiRequest("/auth/register/provider", {
    method: "POST",
    body: payload,
  });
}

// =====================================
// CATEGORIES & SKILLS FETCHING APIS
// =====================================

export const FALLBACK_CATEGORIES = [
  { id: 1, name: "Manual Labor", name_bn: "কায়িক শ্রম", icon: "hammer" },
  { id: 2, name: "Home Repairs", name_bn: "বাসা মেরামত", icon: "wrench" },
  { id: 3, name: "Cleaning & Domestic", name_bn: "পরিষ্কার ও গৃহস্থালি", icon: "sparkles" },
  { id: 4, name: "Transportation", name_bn: "পরিবহন", icon: "truck" },
];

export const FALLBACK_SKILLS_BY_CATEGORY = {
  1: [
    { id: 1, category_id: 1, name: "Day Laborer / Heavy Lifting", name_bn: "দিনমজুর / ভারি কাজ" },
    { id: 2, category_id: 1, name: "Furniture Shifting Helper", name_bn: "আসবাবপত্র স্থানান্তর" },
    { id: 3, category_id: 1, name: "Warehouse Helper", name_bn: "গুদামঘরের সহকারী" },
  ],
  2: [
    { id: 4, category_id: 2, name: "Electrician", name_bn: "ইলেকট্রিশিয়ান" },
    { id: 5, category_id: 2, name: "Plumber", name_bn: "প্লাম্বার" },
    { id: 6, category_id: 2, name: "AC Servicing Helper", name_bn: "এসি সার্ভিসিং" },
    { id: 7, category_id: 2, name: "Appliance Repair", name_bn: "হোম অ্যাপ্লায়েন্স মেরামত" },
  ],
  3: [
    { id: 8, category_id: 3, name: "Home Maid", name_bn: "ছুটা বুয়া" },
    { id: 9, category_id: 3, name: "Deep Cleaning Helper", name_bn: "ডিপ ক্লিনিং" },
    { id: 10, category_id: 3, name: "Painting Helper", name_bn: "রংমিস্ত্রি সহকারী" },
  ],
  4: [
    { id: 11, category_id: 4, name: "Van Driver / 3-Wheeler", name_bn: "ভ্যান চালক" },
    { id: 12, category_id: 4, name: "Small Pickup Driver", name_bn: "পিকআপ চালক" },
  ],
};

/**
 * Fetch all categories from backend
 * GET /api/v1/category/list
 */
export async function fetchCategories(language) {
  try {
    const list = await apiRequest("/category/list", { language });
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    return FALLBACK_CATEGORIES;
  } catch (err) {
    console.warn("fetchCategories failed, using fallback:", err);
    return FALLBACK_CATEGORIES;
  }
}

/**
 * Fetch skills under a specific category
 * GET /api/v1/skill/{category_id}/skills
 */
export async function fetchSkillsByCategory(categoryId, language) {
  try {
    const skills = await apiRequest(`/skill/${categoryId}/skills`, { language });
    if (Array.isArray(skills) && skills.length > 0) {
      return skills;
    }
    return FALLBACK_SKILLS_BY_CATEGORY[categoryId] || [];
  } catch (err) {
    console.warn(`fetchSkillsByCategory for category ${categoryId} failed, using fallback:`, err);
    return FALLBACK_SKILLS_BY_CATEGORY[categoryId] || [];
  }
}

/**
 * Create a new category (Admin / Super Admin)
 * POST /api/v1/category/create
 */
export async function createCategory({ name_en, name_bn }, accessToken) {
  return await apiRequest("/category/create", {
    method: "POST",
    body: {
      name_en: name_en.trim(),
      name_bn: name_bn.trim(),
    },
    accessToken,
  });
}

/**
 * Create a new skill (Admin / Super Admin)
 * POST /api/v1/skill/create
 */
export async function createSkill({ name_en, name_bn, category_id }, accessToken) {
  return await apiRequest("/skill/create", {
    method: "POST",
    body: {
      name_en: name_en.trim(),
      name_bn: name_bn.trim(),
      category_id: Number(category_id),
    },
    accessToken,
  });
}
