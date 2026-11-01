export const API_ENDPOINTS = {
  // =====================================
  // AUTHENTICATION
  // =====================================

  auth: {
    registerSeeker: "/auth/register/seeker",

    registerProvider: "/auth/register/provider",

    login: "/auth/login",

    refresh: "/auth/refresh",

    logout: "/auth/logout",

    fcmToken: "/fcm/token",
  },

  // =====================================
  // USER
  // =====================================

  users: {
    me: "/users/me",
  },

  // =====================================
  // PROVIDER
  // =====================================

  provider: {
    dashboard: "/provider/dashboard",

    updateProfile: "/provider/me/update_profile",

    addSkill: "/provider/me/add_skill",

    removeSkill: (skillId) =>
      `/provider/me/remove_skill?skill_id=${encodeURIComponent(skillId)}`,

    publicProfile: (providerId) =>
      `/provider/${providerId}/public`,
  },

  // =====================================
  // CATEGORY AND SKILL
  // =====================================

  category: {
    list: "/category/list",
  },

  skill: {
    byCategory: (categoryId) =>
      `/skill/${categoryId}/skills`,
  },

  // =====================================
  // SEARCH
  // =====================================

  search: {
    providers: "/search/providers",
  },

  // =====================================
  // BOOKINGS
  // =====================================

  bookings: {
    initiate: "/bookings/initiate",

    lastActiveInitiated:
      "/bookings/seeker/last_active_initiated",

    providerBookings:
      "/bookings/provider/me",

    details: (bookingId) =>
      `/bookings/${bookingId}`,

    respond: (bookingId) =>
      `/bookings/${bookingId}/respond`,

    complete: (bookingId) =>
      `/bookings/${bookingId}/complete`,
  },

  // =====================================
  // URGENT BROADCAST
  // =====================================

  urgentBroadcast: {
    details: (broadcastId) =>
      `/urgentBroadcast/broadcast/${broadcastId}`,

    claim: (broadcastId) =>
      `/urgentBroadcast/broadcast/${broadcastId}/claim`,
  },

  // =====================================
  // REVIEWS
  // =====================================

  reviews: {
    create: "/reviews",
  },
};