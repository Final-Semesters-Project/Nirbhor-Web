"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  RotateCw,
  AlertCircle,
} from "lucide-react";

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyCHBKvR2Wgc4eF53nYTlGYxULSQuVpb9t4";

// Clean plus codes (e.g. "Q9HJ+23X, ") and format readable location name
function sanitizeGoogleAddress(address, placeName = null) {
  if (!address || typeof address !== "string") return address || "";

  // Regular expression to match Plus Codes at the beginning of an address:
  // e.g. "Q9HJ+23X, ", "8Q7C+9F, ", "7MV8Q9HJ+23X, "
  const plusCodeRegex = /^[A-Z0-9]{2,8}\+[A-Z0-9]{2,5}(?:,\s*|\s+)/i;

  let cleaned = address.trim();
  if (plusCodeRegex.test(cleaned)) {
    cleaned = cleaned.replace(plusCodeRegex, "").trim();
  }

  // If a place name was provided (e.g. "Agargaon Metro Rail Gate-C.") and it's not already in cleaned address,
  // prepend it so the user sees the specific establishment/gate name they chose.
  if (
    placeName &&
    typeof placeName === "string" &&
    placeName.trim() &&
    !cleaned.toLowerCase().includes(placeName.toLowerCase().trim())
  ) {
    cleaned = `${placeName.trim()}, ${cleaned}`;
  }

  return cleaned || address;
}

export default function GoogleMapPickerModal({
  isOpen,
  onClose,
  initialLat = 23.8103,
  initialLng = 90.4125,
  initialAddress = "",
  onConfirmLocation,
  language = "bn",
}) {
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);
  const [geocoderInstance, setGeocoderInstance] = useState(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [formattedAddress, setFormattedAddress] = useState(initialAddress);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  const isBn = language === "bn";

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentLat(Number(initialLat) || 23.8103);
      setCurrentLng(Number(initialLng) || 90.4125);
      setFormattedAddress(sanitizeGoogleAddress(initialAddress || ""));
      setMapError(null);
      setIsMapLoading(true);
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  // Load Google Maps JavaScript API script and initialize map
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    let pollInterval = null;
    let timeoutTimer = null;

    function setupMap() {
      if (!mapContainerRef.current || !window.google || !window.google.maps) {
        return;
      }

      try {
        const center = {
          lat: Number(currentLat) || 23.8103,
          lng: Number(currentLng) || 90.4125,
        };

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          gestureHandling: "greedy",
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });

        // Theme colored custom marker pin
        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: isBn ? "পিন ড্র্যাগ করে অবস্থান পরিবর্তন করুন" : "Drag to set exact address",
        });

        const geocoder = new window.google.maps.Geocoder();

        setMapInstance(map);
        setMarkerInstance(marker);
        setGeocoderInstance(geocoder);
        setIsMapLoading(false);

        // Perform initial reverse geocode if address is empty
        if (!formattedAddress) {
          reverseGeocode(center.lat, center.lng, geocoder);
        }

        // 1. Marker Drag Listener
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) {
            const lat = Number(pos.lat().toFixed(6));
            const lng = Number(pos.lng().toFixed(6));
            setCurrentLat(lat);
            setCurrentLng(lng);
            reverseGeocode(lat, lng, geocoder);
          }
        });

        // 2. Map Click Listener -> Move Marker
        map.addListener("click", (e) => {
          if (e.latLng) {
            const lat = Number(e.latLng.lat().toFixed(6));
            const lng = Number(e.latLng.lng().toFixed(6));
            marker.setPosition(e.latLng);
            setCurrentLat(lat);
            setCurrentLng(lng);
            reverseGeocode(lat, lng, geocoder);
          }
        });

        // 3. Search Autocomplete
        if (searchInputRef.current && window.google.maps.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(
            searchInputRef.current,
            {
              componentRestrictions: { country: "bd" }, // Bangladesh
              fields: ["formatted_address", "geometry", "name"],
            }
          );

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              // Exact pinpoint latitude and longitude are preserved
              const lat = Number(place.geometry.location.lat().toFixed(6));
              const lng = Number(place.geometry.location.lng().toFixed(6));

              map.setCenter(place.geometry.location);
              map.setZoom(16);
              marker.setPosition(place.geometry.location);

              setCurrentLat(lat);
              setCurrentLng(lng);

              // Use clean human-readable address without plus codes
              const searchVal = searchInputRef.current?.value?.trim();
              const plusCodeRegex = /^[A-Z0-9]{2,8}\+[A-Z0-9]{2,5}/i;
              let targetAddr = sanitizeGoogleAddress(place.formatted_address || place.name || "", place.name);

              if (searchVal && !plusCodeRegex.test(searchVal)) {
                if (searchVal.toLowerCase().includes(place.name?.toLowerCase() || "")) {
                  targetAddr = searchVal;
                }
              }

              setFormattedAddress(targetAddr);
            }
          });
        }

        // Trigger map resize event to force canvas rendering in full height
        setTimeout(() => {
          if (window.google?.maps && map) {
            window.google.maps.event.trigger(map, "resize");
            map.setCenter(center);
          }
        }, 150);
      } catch (err) {
        console.error("Google Maps setup error:", err);
        setIsMapLoading(false);
        setMapError(
          isBn
            ? "গুগল ম্যাপ লোড হতে সমস্যা হয়েছে।"
            : "Could not initialize Google Maps instance."
        );
      }
    }

    function initGoogleMaps() {
      if (typeof window === "undefined") return;

      // Handle Google Maps Auth Failure
      window.gm_authFailure = () => {
        setIsMapLoading(false);
        setMapError(
          isBn
            ? "গুগল ম্যাপ অথেনটিকেশন ব্যর্থ হয়েছে। এপিআই কী সক্রিয় আছে কিনা নিশ্চিত করুন।"
            : "Google Maps authentication failed. Please verify API key activation."
        );
      };

      if (window.google && window.google.maps) {
        setupMap();
        return;
      }

      // Check if script tag is already in DOM
      let script = document.getElementById("google-maps-script");
      if (!script) {
        script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      // Poll until Google Maps API finishes loading
      pollInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(pollInterval);
          if (!isCancelled) {
            setupMap();
          }
        }
      }, 100);

      timeoutTimer = setTimeout(() => {
        clearInterval(pollInterval);
        if (!window.google?.maps && !isCancelled) {
          setIsMapLoading(false);
          setMapError(
            isBn
              ? "গুগল ম্যাপ লোড হতে সময় বেশি লাগছে। ইন্টারনেট সংযোগ পুনরায় পরীক্ষা করুন।"
              : "Google Maps timed out. Please check your internet connection."
          );
        }
      }, 10000);
    }

    // Give DOM a tick to paint modal and mapContainerRef
    const startTimer = setTimeout(() => {
      initGoogleMaps();
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(startTimer);
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [isOpen, isBn]);

  // Reverse Geocoding Helper
  const reverseGeocode = (lat, lng, geocoderObj = geocoderInstance) => {
    if (!geocoderObj && window.google?.maps) {
      geocoderObj = new window.google.maps.Geocoder();
    }
    if (!geocoderObj) return;

    geocoderObj.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        let bestAddr = sanitizeGoogleAddress(results[0].formatted_address || "");

        // If results[0] had only a plus code and became too short or empty, check results[1]
        if (!bestAddr || bestAddr.length < 5) {
          if (results[1] && results[1].formatted_address) {
            bestAddr = sanitizeGoogleAddress(results[1].formatted_address);
          }
        }

        setFormattedAddress(bestAddr || results[0].formatted_address);
      } else {
        setFormattedAddress(
          isBn
            ? `অবস্থান: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
            : `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
      }
    });
  };

  // Browser Geolocation trigger
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      alert(
        isBn
          ? "আপনার ব্রাউজার জিপিএস সমর্থন করে না।"
          : "GPS Geolocation is not supported by your browser."
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setCurrentLat(lat);
        setCurrentLng(lng);

        if (mapInstance && markerInstance) {
          const latLng = new window.google.maps.LatLng(lat, lng);
          mapInstance.panTo(latLng);
          mapInstance.setZoom(16);
          markerInstance.setPosition(latLng);
        }

        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        console.warn("GPS error:", error);
        alert(
          isBn
            ? "সরাসরি জিপিএস পাওয়া যায়নি। ম্যাপে ক্লিক করে অবস্থান নির্ধারণ করুন।"
            : "Could not detect GPS location. Please click on the map to pin your location."
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (onConfirmLocation) {
      onConfirmLocation({
        latitude: currentLat,
        longitude: currentLng,
        address:
          formattedAddress ||
          (isBn ? `ঢাকা (${currentLat}, ${currentLng})` : `Dhaka (${currentLat}, ${currentLng})`),
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f8faf9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#00695C] flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {isBn ? "গুগল ম্যাপে অবস্থান নির্ধারণ করুন" : "Set Location on Google Maps"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? "ম্যাপে ক্লিক করে বা পিন ড্র্যাগ করে কর্মস্থলের সঠিক অবস্থান নির্বাচন করুন"
                  : "Click on map or drag the pin to set your exact work location"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar on Top of Map */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                isBn
                  ? "এলাকা বা সড়কের নাম লিখে খুঁজুন..."
                  : "Search area, street or landmark..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C] transition-all font-medium"
            />
          </div>

          <button
            type="button"
            onClick={handleGPSDetect}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-[#00695C] hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
            <span>
              {isLocating
                ? isBn
                  ? "শনাক্ত হচ্ছে..."
                  : "Locating..."
                : isBn
                ? "আমার জিপিএস অবস্থান"
                : "My GPS Location"}
            </span>
          </button>
        </div>

        {/* Map Viewport Area - Explicit 450px Height so Canvas NEVER collapses */}
        <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-100 overflow-hidden">
          {/* Map canvas container */}
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ width: "100%", height: "100%", minHeight: "400px" }}
          />

          {/* Loading Overlay */}
          {isMapLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs gap-3 z-10">
              <div className="w-9 h-9 border-3 border-[#00695C]/20 border-t-[#00695C] rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-600">
                {isBn ? "গুগল ম্যাপ লোড হচ্ছে..." : "Loading Google Maps..."}
              </p>
            </div>
          )}

          {/* Error notice if map key fails */}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 z-20">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                {isBn ? "ম্যাপ লোড ত্রুটি" : "Map Loading Error"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">{mapError}</p>
              <button
                type="button"
                onClick={() => {
                  setMapError(null);
                  setIsMapLoading(true);
                  const scr = document.getElementById("google-maps-script");
                  if (scr) scr.remove();
                  window.location.reload();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00695C] text-white text-xs font-bold cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isBn ? "পুনরায় চেষ্টা করুন" : "Retry"}</span>
              </button>
            </div>
          )}

          {/* Map interaction tip badge */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold shadow-md">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>
                {isBn ? "পিন ড্র্যাগ করুন বা ম্যাপে ক্লিক করুন" : "Drag marker or click map to locate"}
              </span>
            </span>
          </div>
        </div>

        {/* Modal Footer with Selected Address and Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-[#f8faf9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#00695C] flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isBn ? "নির্ধারিত অবস্থান" : "Confirmed Location"}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-md">
                {formattedAddress || (isBn ? "ম্যাপ থেকে অবস্থান নির্বাচন করুন" : "Pin a location on map")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-[#00695C] hover:bg-[#00574C] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00695C]/20 transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isBn ? "এই অবস্থান নিশ্চিত করুন" : "Confirm Pin Location"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
