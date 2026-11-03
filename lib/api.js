import {
  getAccessToken,
  saveAuthSession,
  getUserRole,
  getUserId,
  clearAuthSession,
} from "./auth";

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    // In browser, route requests through the Next.js internal backend proxy
    // to prevent CORS preflight blocks and staging key rejection
    return "/api/backend";
  }
  return (
    process.env.BACKEND_API_URL
      ? `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api/v1`
      : "https://nirbhor-backend-6yuf.onrender.com/api/v1"
  );
}

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
  const baseUrl = getApiBaseUrl();

  // Determine active language
  const activeLang = language || getCurrentLanguage();

  // Prepare request headers
  const requestHeaders = {
    Accept: "application/json",
    "Accept-Language": activeLang,
    "x-nirbhor-lang": activeLang,
    ...headers,
  };

  // Add staging key if configured
  if (STAGING_KEY) {
    requestHeaders["X-Staging-Key"] = STAGING_KEY;
  }

  // Add access token if provided or retrieve from storage
  const authToken = accessToken || getAccessToken();
  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
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
  let response;
  try {
    response = await fetch(`${baseUrl}${normalizedEndpoint}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
      cache: "no-store",
    });
  } catch (fetchErr) {
    console.warn(`Fetch error requesting ${baseUrl}${normalizedEndpoint}:`, fetchErr);
    throw new Error(
      activeLang === "bn"
        ? "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। ইন্টারনেট সংযোগ পুনরায় পরীক্ষা করুন।"
        : "Unable to connect to server. Please check your internet connection."
    );
  }

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

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        clearAuthSession();
      }
      errorMessage =
        activeLang === "bn"
          ? "আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে (Invalid credentials)। অনুগ্রহ করে পুনরায় লগইন করুন।"
          : "Your login session has expired (Invalid credentials). Please log in again.";
    }

    // Do not trigger Next.js full error modal for the expected 7-day radius update rule;
    // other genuine API failures will still log console.error and display the dev issue overlay.
    const isRadiusLimitError =
      (response.status === 400 && normalizedEndpoint.includes("/provider/me/update_profile")) ||
      errorMessage.toLowerCase().includes("radius") ||
      errorMessage.toLowerCase().includes("7 days") ||
      errorMessage.includes("৭ দিন");

    if (isRadiusLimitError) {
      console.warn(`[Validation ${response.status}] ${method} ${normalizedEndpoint}:`, errorMessage);
    } else {
      console.error(`[API Error ${response.status}] ${method} ${normalizedEndpoint}:`, errorMessage, responseData);
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = responseData;
    error.endpoint = normalizedEndpoint;
    throw error;
  }

  return responseData;
}

// =====================================
// AUTHENTICATION API FUNCTIONS
// =====================================

// Re-export auth utilities for convenience
export { saveAuthSession, getAccessToken, getUserRole, getUserId, clearAuthSession };

/**
 * Login with phone number and password (OAuth2 Form / URL Encoded)
 * POST /api/v1/auth/login
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
 * POST /api/v1/auth/register/provider
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

// =====================================
// PROVIDER DASHBOARD & PROFILE APIS
// Matches ProviderHomeController in Flutter
// =====================================

/**
 * Fetch provider dashboard data
 * GET /api/v1/provider/dashboard
 */
export async function fetchProviderDashboard(accessToken, language) {
  return await apiRequest("/provider/dashboard", {
    accessToken,
    language,
  });
}

/**
 * Fetch authenticated user profile me
 * GET /api/v1/users/me
 */
export async function fetchUserProfileMe(accessToken, language) {
  return await apiRequest("/users/me", {
    accessToken,
    language,
  });
}

/**
 * Update provider profile (availability, radius, location, photos)
 * PATCH /api/v1/provider/me/update_profile
 */
export async function updateProviderProfile(updateData, accessToken, language) {
  return await apiRequest("/provider/me/update_profile", {
    method: "PATCH",
    body: updateData,
    accessToken,
    language,
  });
}

/**
 * Toggle provider availability
 * PATCH /api/v1/provider/me/update_profile { is_available }
 */
export async function updateProviderAvailability(isAvailable, accessToken, language) {
  return await updateProviderProfile({ is_available: Boolean(isAvailable) }, accessToken, language);
}

/**
 * Update provider working radius in KM (1 to 5 KM)
 * PATCH /api/v1/provider/me/update_profile { working_radius_km }
 */
export async function updateProviderWorkingRadius(radiusKm, accessToken, language) {
  return await updateProviderProfile({ working_radius_km: Number(radiusKm) }, accessToken, language);
}

/**
 * Add skills to provider profile
 * POST /api/v1/provider/me/add_skill { skill_ids: [...] }
 */
export async function addProviderSkills(skillIds, accessToken, language) {
  return await apiRequest("/provider/me/add_skill", {
    method: "POST",
    body: {
      skill_ids: skillIds,
    },
    accessToken,
    language,
  });
}

/**
 * Remove a skill from provider profile
 * DELETE /api/v1/provider/me/remove_skill?skill_id={id}
 */
export async function removeProviderSkill(skillId, accessToken, language) {
  return await apiRequest(`/provider/me/remove_skill?skill_id=${skillId}`, {
    method: "DELETE",
    accessToken,
    language,
  });
}

// =====================================
// PROFILE PHOTO & NID VERIFICATION APIS
// Matches Profile and NID Uploads in Flutter
// =====================================

/**
 * Direct upload profile photo to Cloudinary without backend signature
 * Matches uploadProfilePhotoToCloudinary in Flutter
 */
export async function uploadProfilePhotoToCloudinary(file, accessToken = null) {
  let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // If cloudName not in env, retrieve dynamically from backend signature if token exists
  if (!cloudName && accessToken) {
    try {
      const sigData = await getNidUploadSignature("front", accessToken);
      if (sigData?.cloud_name) {
        cloudName = sigData.cloud_name;
      }
    } catch (e) {
      console.warn("Could not retrieve cloud_name dynamically from backend:", e);
    }
  }

  // Fallback default
  if (!cloudName) {
    cloudName = "nirbhor";
  }

  const uri = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  // Presets to try for direct unsigned upload (matching Flutter presets)
  const presetsToTry = [
    process.env.NEXT_PUBLIC_CLOUDINARY_PROFILE_PICTURE_PRESET,
    process.env.NEXT_PUBLIC_CLOUDINARY_PROFILE_PRESET,
    "nirbhor_profile_picture",
    "nirbhor_profile",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    "ml_default",
  ].filter(Boolean);

  let lastError = null;

  for (const preset of presetsToTry) {
    try {
      console.log(`====> Trying direct Cloudinary upload with preset: ${preset}`);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);

      const res = await fetch(uri, {
        method: "POST",
        body: formData,
      });

      console.log(
        `====> Cloudinary upload response [${preset}] [${res.status}]`
      );

      if (res.ok) {
        const resJson = await res.json();
        const secureUrl = resJson.secure_url || "";
        const resPublicId = resJson.public_id || "";
        console.log("====> Direct Cloudinary upload success!");
        console.log("====> Photo URL:", secureUrl);
        console.log("====> Public ID:", resPublicId);
        return {
          secure_url: secureUrl,
          public_id: resPublicId,
        };
      } else {
        const errorText = await res.text();
        console.warn(`Cloudinary upload with preset [${preset}] failed:`, errorText);
        lastError = new Error(errorText || `Cloudinary upload failed [${preset}]`);
      }
    } catch (ex) {
      console.warn(`Error trying preset ${preset}:`, ex);
      lastError = ex;
    }
  }

  throw lastError || new Error("Failed to upload profile photo to Cloudinary.");
}

/**
 * Get Cloudinary upload signature for NID photo
 * GET /api/v1/uploads/upload-signature/nid?side=front|back
 */
export async function getNidUploadSignature(side, accessToken, language) {
  return await apiRequest(`/uploads/upload-signature/nid?side=${side}`, {
    accessToken,
    language,
  });
}

/**
 * Upload NID file directly to Cloudinary using signed signature
 */
export async function uploadNidImageToCloudinary(file, signatureData) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signatureData.signature);
  formData.append("timestamp", signatureData.timestamp.toString());
  formData.append("api_key", signatureData.api_key);
  formData.append("folder", signatureData.folder);
  formData.append("public_id", signatureData.public_id);
  formData.append("type", signatureData.type || signatureData.access_type || "authenticated");
  formData.append("overwrite", signatureData.overwrite ? "true" : "false");
  formData.append("upload_preset", signatureData.upload_preset);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;

  const res = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Cloudinary upload failed:", errorText);
    throw new Error("Cloudinary image upload failed. Please try again.");
  }

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
  };
}

/**
 * Submit NID verification photos to provider profile
 * Automatically sets status to 'pending' once both photos are uploaded
 */
export async function submitNidVerification({
  nid_url_front,
  nid_front_public_id,
  nid_url_back,
  nid_back_public_id,
}, accessToken, language) {
  return await updateProviderProfile(
    {
      nid_url_front,
      nid_front_public_id,
      nid_url_back,
      nid_back_public_id,
    },
    accessToken,
    language
  );
}

// =====================================
// PROVIDER BOOKINGS APIS
// Matches Provider Bookings functions in Flutter
// =====================================

/**
 * Fetch provider incoming / active bookings
 * GET /api/v1/bookings/provider/me?page=1&page_size=20
 */
export async function fetchProviderIncomingBookings(
  { page = 1, pageSize = 20 } = {},
  accessToken,
  language
) {
  return await apiRequest(`/bookings/provider/me?page=${page}&page_size=${pageSize}`, {
    accessToken,
    language,
  });
}

/**
 * Fetch provider completed bookings
 * GET /api/v1/bookings/provider/me/completed
 */
export async function fetchProviderCompletedBookings(accessToken, language) {
  return await apiRequest("/bookings/provider/me/completed", {
    accessToken,
    language,
  });
}

/**
 * Fetch single booking detail
 * GET /api/v1/bookings/{booking_id}
 */
export async function fetchBookingDetail(bookingId, accessToken, language) {
  return await apiRequest(`/bookings/${bookingId}`, {
    accessToken,
    language,
  });
}
