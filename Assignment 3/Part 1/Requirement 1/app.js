export const MAPQUEST_API_KEY = "IJwxYwuu2wljoAjZWuJsAS65ldnHdMpZ";

L.mapquest.key = MAPQUEST_API_KEY;

const map = L.mapquest.map("map", {
  center: [18.1096, -77.2975], // Jamaica default
  layers: L.mapquest.tileLayer("map"),
  zoom: 8
});

let currentMarker = null;

/**
 * @description Sends a request to the MapQuest Geocoding API using fetch()
 * and returns the latitude and longitude of the first matching result.
 */
async function getCoordinates(location) {
  try {
    const url = `https://www.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_API_KEY}&location=${encodeURIComponent(location)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch geocoding data.");
    }

    const data = await response.json();

    const result = data.results?.[0]?.locations?.[0]?.latLng;

    if (!result) {
      alert("Location not found. Please try another search.");
      return null;
    }

    return {
      lat: result.lat,
      lng: result.lng
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    alert("Something went wrong while searching for the location.");
    return null;
  }
}

/**
 * @description Moves the map to the selected coordinates and places
 * a custom marker at that location.
 */
function flyToLocation(lat, lng) {
  map.flyTo([lat, lng], 13, {
    duration: 2
  });

  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  const customIcon = L.divIcon({
    className: "",
    html: '<div class="custom-marker"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  currentMarker = L.marker([lat, lng], {
    icon: customIcon
  }).addTo(map);
}

/**
 * @description Reads the value from the input field, geocodes the location,
 * then updates the map and marker.
 */
async function searchLocation() {
  const input = document.getElementById("locationInput");
  const location = input.value.trim();

  if (!location) {
    alert("Please enter a location.");
    return;
  }

  const coordinates = await getCoordinates(location);

  if (coordinates) {
    flyToLocation(coordinates.lat, coordinates.lng);
  }
}

document.getElementById("searchBtn").addEventListener("click", searchLocation);

document.getElementById("locationInput").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchLocation();
  }
});