import * as pkg from "https://esm.sh/@fragaria/address-formatter";
const addressFormatter = pkg.addressFormatter || pkg.default || pkg;

function initApp() {
  // UI Elements
  const mapElement = document.getElementById("map");
  const coordsInput = document.getElementById("coords-input");
  const searchBtn = document.getElementById("search-btn");
  const addressOutput = document.getElementById("address-output");
  const latOutput = document.getElementById("lat-output");
  const lngOutput = document.getElementById("lng-output");
  const loader = document.getElementById("loader");
  const copyBtn = document.getElementById("copy-btn");
  const copyCoordsBtn = document.getElementById("copy-coords-btn");
  const clearInputBtn = document.getElementById("clear-input-btn");
  const toast = document.getElementById("toast");
  const regionalFormatCb = document.getElementById("regional-format-cb");
  const labelRegional = document.getElementById("label-regional");

  // Options Elements
  const optionsBtn = document.getElementById("options-btn");
  const optionsDropdown = document.getElementById("options-dropdown");
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  const langToggleText = document.getElementById("lang-toggle-text");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeToggleText = document.getElementById("theme-toggle-text");

  // Elements for translation
  const pageTitle = document.getElementById("page-title");
  const headerTitle = document.getElementById("header-title");
  const headerSubtitle = document.getElementById("header-subtitle");
  const labelCoords = document.getElementById("label-coords");
  const searchText = document.getElementById("search-text");
  const labelAddress = document.getElementById("label-address");
  const infoAuthor = document.getElementById("info-author");
  const infoVersion = document.getElementById("info-version");

  // Default location (e.g., center of Madrid)
  const DEFAULT_LAT = 40.4168;
  const DEFAULT_LNG = -3.7038;
  const DEFAULT_ZOOM = 13;

  // Initialize Leaflet Map
  const map = L.map("map", {
    zoomControl: false, // Personalizamos el control de zoom
  }).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

  const zoomControl = L.control.zoom({ position: "bottomright" }).addTo(map);

  // Mover el control de zoom a la parte superior en móvil
  function updateZoomPosition() {
    if (window.innerWidth <= 600) {
      zoomControl.setPosition("topright");
    } else {
      zoomControl.setPosition("bottomright");
    }
  }

  // Posición inicial y listener de redimensión
  updateZoomPosition();
  window.addEventListener("resize", updateZoomPosition);

  // Theme and Language state
  let savedLang = localStorage.getItem("lang");
  let currentLang = "es";

  if (savedLang) {
    currentLang = savedLang === "en" ? "en" : "es";
  } else if (navigator.language || navigator.userLanguage) {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith("en")) {
      currentLang = "en";
    }
  }

  let currentTheme = localStorage.getItem("theme");
  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (!currentTheme) {
    currentTheme = systemPrefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update theme toggle text
    const isDark = theme === "dark";
    if (currentLang === "es") {
      themeToggleText.textContent = isDark ? "Modo Claro" : "Modo Oscuro";
    } else {
      themeToggleText.textContent = isDark ? "Light Mode" : "Dark Mode";
    }

    // El filtro oscuro del mapa ahora se maneja puramente por CSS
    // para no afectar a los controles de Leaflet ni al marcador personalizado.
  }

  // Set Tile Layer (OSM standard, but you can use others like CartoDB for more minimalism)
  // Using standard OSM
  const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileLayer = L.tileLayer(tileUrl, {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Initialize theme
  applyTheme(currentTheme);

  // Translations
  const translations = {
    es: {
      pageTitle: "Buscador de Dirección por Coordenadas",
      headerTitle: "Buscador de Direcciones",
      headerSubtitle: "Introduce coordenadas o haz clic en el mapa",
      labelCoords: "Coordenadas (Lat, Lng)",
      placeholderInput: "Ej: 40.4168, -3.7038",
      searchText: "Buscar",
      labelAddress: "Dirección postal",
      labelRegional: "Respetar formato regional",
      placeholderAddress:
        "Selecciona un punto en el mapa o introduce coordenadas.",
      placeholderError: "No se encontró una dirección para esta ubicación.",
      placeholderNetworkError:
        "Error al conectar con el servidor de geocodificación.",
      toastAddress: "Dirección copiada",
      toastCoords: "Coordenadas copiadas",
      themeDark: "Modo Oscuro",
      themeLight: "Modo Claro",
      langToggle: "English",
      infoAuthor: "Autor:",
      infoVersion: "Versión:",
    },
    en: {
      pageTitle: "Address Finder from Coordinates",
      headerTitle: "Address Finder",
      headerSubtitle: "Enter coordinates or click on the map",
      labelCoords: "Coordinates (Lat, Lng)",
      placeholderInput: "Ex: 40.4168, -3.7038",
      searchText: "Search",
      labelAddress: "Postal Address",
      labelRegional: "Respect regional format",
      placeholderAddress: "Select a point on the map or enter coordinates.",
      placeholderError: "No address found for this location.",
      placeholderNetworkError: "Error connecting to geocoding server.",
      toastAddress: "Address copied",
      toastCoords: "Coordinates copied",
      themeDark: "Dark Mode",
      themeLight: "Light Mode",
      langToggle: "Español",
      infoAuthor: "Author:",
      infoVersion: "Version:",
    },
  };

  // State text for placeholder message checking
  let currentPlaceholderMsg = translations.es.placeholderAddress;

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    const t = translations[lang];

    pageTitle.textContent = t.pageTitle;
    headerTitle.textContent = t.headerTitle;
    headerSubtitle.textContent = t.headerSubtitle;
    labelCoords.textContent = t.labelCoords;
    coordsInput.placeholder = t.placeholderInput;
    searchText.textContent = t.searchText;
    labelAddress.textContent = t.labelAddress;
    labelRegional.textContent = t.labelRegional;
    langToggleText.textContent = t.langToggle;
    infoAuthor.textContent = t.infoAuthor;
    infoVersion.textContent = t.infoVersion;

    // Update theme toggle text based on active language and theme
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    themeToggleText.textContent = isDark ? t.themeLight : t.themeDark;

    // Update placeholder text if it's currently showing
    if (addressOutput.classList.contains("placeholder")) {
      // Very basic check, we just set the default one, or try to keep equivalent error
      addressOutput.textContent = t.placeholderAddress;
      currentPlaceholderMsg = t.placeholderAddress;
    }
  }

  // State text for selected location data
  let currentGeocodeData = null;

  regionalFormatCb.addEventListener("change", () => {
    if (currentGeocodeData) {
      updateAddressDisplay(currentGeocodeData);
    }
  });

  function updateAddressDisplay(data) {
    if (data.error || !data.display_name) {
      addressOutput.textContent = translations[currentLang].placeholderError;
      addressOutput.classList.add("placeholder");
      copyBtn.style.display = "none";
    } else {
      let finalAddress = data.display_name;

      if (regionalFormatCb.checked && data.address) {
        try {
          // Limpiar metadatos técnicos de Nominatim (ej. ISO3166-2-lvl4: "US-FL")
          // que ensucian o duplican la información regional.
          const cleanAddress = { ...data.address };
          Object.keys(cleanAddress).forEach((key) => {
            if (key.startsWith("ISO3166")) {
              delete cleanAddress[key];
            }
          });
          finalAddress = addressFormatter.format(cleanAddress);
        } catch (error) {
          console.error("Error formatting regional address:", error);
        }
      }

      addressOutput.textContent = finalAddress;
      addressOutput.classList.remove("placeholder");
      copyBtn.style.display = "flex";
    }
  }

  // Marker instance
  let currentMarker = null;

  /**
   * Updates marker position, view, and input UI.
   * @param {number} lat
   * @param {number} lng
   * @param {boolean} pan
   */
  function updateLocation(lat, lng, pan = true) {
    const roundedLat = lat.toFixed(6);
    const roundedLng = lng.toFixed(6);

    latOutput.textContent = roundedLat;
    lngOutput.textContent = roundedLng;
    coordsInput.value = `${roundedLat}, ${roundedLng}`;
    copyCoordsBtn.style.display = "flex";
    clearInputBtn.style.display = "flex";

    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: "<div class='marker-pin'></div><div class='marker-pulse'></div>",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });

    if (!currentMarker) {
      currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    } else {
      currentMarker.setLatLng([lat, lng]);
      currentMarker.setIcon(customIcon);
    }

    if (pan) {
      map.setView([lat, lng], 16);
    }

    fetchAddress(lat, lng);
  }

  /**
   * Reverse Geocoding via Nominatim API
   * @param {number} lat
   * @param {number} lng
   */
  async function fetchAddress(lat, lng) {
    // UI states
    addressOutput.style.display = "none";
    loader.style.display = "inline-block";

    // Nominatim API endpoint
    // Added accept-language for consistent results
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${currentLang}`;

    try {
      const response = await fetch(url, {
        headers: {
          // Nominatim requires a valid user agent
          "User-Agent": "BuscadorDireccionesApp/1.0",
        },
      });

      if (!response.ok) throw new Error("Respuesta de red incorrecta");

      const data = await response.json();
      currentGeocodeData = data;

      loader.style.display = "none";
      addressOutput.style.display = "block";

      updateAddressDisplay(data);
    } catch (error) {
      loader.style.display = "none";
      addressOutput.style.display = "block";
      addressOutput.textContent =
        translations[currentLang].placeholderNetworkError;
      addressOutput.classList.add("placeholder");
      copyBtn.style.display = "none";
      console.error(error);
    }
  }

  /**
   * Parses user input into coordinates
   */
  function handleSearch() {
    const inputStr = coordsInput.value.trim();
    // Regex to match "lat, lng" optionally with spaces, or standard positive/negative numbers
    const regex = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

    const match = inputStr.match(regex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        updateLocation(lat, lng);
      } else {
        alert(
          "Las coordenadas están fuera de rango (Lat: -90 a 90, Lng: -180 a 180)",
        );
      }
    } else {
      alert(
        'Formato no válido. Usa el formato "Latitud, Longitud" (ej: 40.4168, -3.7038)',
      );
    }
  }

  // Map Click Event
  map.on("click", (e) => {
    // Si el menú de opciones está abierto, el clic en el mapa solo debe cerrarlo, no poner un marcador
    if (optionsDropdown.classList.contains("show")) {
      return;
    }

    const { lat, lng } = e.latlng;
    // Don't pan forcefully on every click to avoid jarring UX, just update marker and address
    updateLocation(lat, lng, false);
  });

  // Button Events
  searchBtn.addEventListener("click", handleSearch);

  // Copy Button Event
  copyBtn.addEventListener("click", () => {
    const addressText = addressOutput.textContent;
    if (addressText && !addressOutput.classList.contains("placeholder")) {
      navigator.clipboard
        .writeText(addressText)
        .then(() => {
          // Show toast
          toast.textContent = translations[currentLang].toastAddress;
          toast.classList.add("show");
          setTimeout(() => {
            toast.classList.remove("show");
          }, 3000); // Hide after 3 seconds
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles: ", err);
        });
    }
  });

  // Copy Coordinates Button Event
  copyCoordsBtn.addEventListener("click", () => {
    const latText = latOutput.textContent;
    const lngText = lngOutput.textContent;
    if (latText !== "--" && lngText !== "--") {
      const coordsText = `${latText}, ${lngText}`;
      navigator.clipboard
        .writeText(coordsText)
        .then(() => {
          // Show toast
          toast.textContent = translations[currentLang].toastCoords;
          toast.classList.add("show");
          setTimeout(() => {
            toast.classList.remove("show");
          }, 3000); // Hide after 3 seconds
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles: ", err);
        });
    }
  });

  // Input Enter Key Event
  coordsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  // Coordinates Input Event
  coordsInput.addEventListener("input", () => {
    if (coordsInput.value.length > 0) {
      clearInputBtn.style.display = "flex";
    } else {
      clearInputBtn.style.display = "none";
    }
  });

  // Clear Input Event
  clearInputBtn.addEventListener("click", () => {
    coordsInput.value = "";
    clearInputBtn.style.display = "none";

    latOutput.textContent = "--";
    lngOutput.textContent = "--";
    copyCoordsBtn.style.display = "none";

    addressOutput.textContent = translations[currentLang].placeholderAddress;
    addressOutput.classList.add("placeholder");
    copyBtn.style.display = "none";

    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }

    coordsInput.focus();
  });

  // Options Menu Toggle
  optionsBtn.addEventListener("click", () => {
    optionsDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!optionsBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
      optionsDropdown.classList.remove("show");
    }
  });

  // Opciones de Geolocalización
  const locateBtn = document.getElementById("locate-btn");

  locateBtn.addEventListener("click", () => {
    // UI behavior: Change icon to loading or visual feedback could be added here

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation(latitude, longitude, true);
        },
        (error) => {
          let errorMsg = "No se pudo obtener la ubicación.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Permiso de ubicación denegado por el usuario.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Información de ubicación no disponible.";
              break;
            case error.TIMEOUT:
              errorMsg = "Se agotó el tiempo para obtener la ubicación.";
              break;
          }
          alert(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      alert("La geolocalización no es soportada por tu navegador.");
    }
  });

  // Theme Toggle Event
  themeToggleBtn.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(newTheme);
  });

  // Initialize language UI properly on load
  applyLanguage(currentLang);

  // Language Toggle Event
  langToggleBtn.addEventListener("click", () => {
    const newLang = currentLang === "es" ? "en" : "es";
    applyLanguage(newLang);

    // Update marker address text in new language if one exists
    if (currentMarker) {
      const latlng = currentMarker.getLatLng();
      fetchAddress(latlng.lat, latlng.lng);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
