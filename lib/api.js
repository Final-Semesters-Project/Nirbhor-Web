const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;


// =====================================
// API REQUEST FUNCTION
// =====================================

export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    accessToken,
    language = "en",
    headers = {},
  } = {}
) {

  // Check backend URL
  if (!API_BASE_URL) {
    throw new Error(
      "Backend API URL is not configured."
    );
  }


  // Prepare request headers
  const requestHeaders = {
    Accept: "application/json",
    "Accept-Language": language,
    ...headers,
  };


  // Add access token
  if (accessToken) {
    requestHeaders.Authorization =
      `Bearer ${accessToken}`;
  }


  // Detect request body types
  const isFormData =
    typeof FormData !== "undefined" &&
    body instanceof FormData;

  const isUrlEncoded =
    typeof URLSearchParams !== "undefined" &&
    body instanceof URLSearchParams;


  // Prepare request body
  let requestBody;


  if (isFormData) {

    requestBody = body;

  } else if (isUrlEncoded) {

    requestHeaders["Content-Type"] =
      "application/x-www-form-urlencoded";

    requestBody = body.toString();

  } else if (body !== undefined) {

    requestHeaders["Content-Type"] =
      "application/json";

    requestBody = JSON.stringify(body);

  }


  // Send request
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: "same-origin",
      cache: "no-store",
    }
  );


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

    const detail = responseData?.detail;

    const errorMessage =
      typeof detail === "string"
        ? detail
        : responseData?.message ||
          `Request failed with status ${response.status}`;

    const error = new Error(errorMessage);

    error.status = response.status;

    error.data = responseData;

    throw error;

  }


  return responseData;

}