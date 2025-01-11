const NASA_API_KEY = "DEMO_KEY";
const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
const SPACE_WEATHER_URL = "https://api.open-meteo.com/v1/space-weather?timezone=UTC&hourly=kp_index,solar_flare,aurora,solar_wind";

let currentApodDate = '';

async function fetchAPOD(date = null) {
  try {
    const url = date 
      ? `${NASA_APOD_URL}&date=${date}`
      : NASA_APOD_URL;
    
    const response = await fetch(url);
    const data = await response.json();

    currentApodDate = data.date;
    document.getElementById("title").textContent = data.title;
    document.getElementById("image").src = data.url;
    document.getElementById("description").textContent = data.explanation;

    // Update bookmark button state
    const bookmarks = await getBookmarks();
    updateBookmarkButton(bookmarks.includes(currentApodDate));
  } catch (error) {
    console.error("Error fetching APOD:", error);
    document.getElementById("description").textContent = 
      "Unable to load APOD data. Please try again later.";
  }
}

async function fetchSpaceWeather() {
  try {
    const response = await fetch(SPACE_WEATHER_URL);
    const data = await response.json();
    const { kp_index, solar_flare, aurora, solar_wind } = data.hourly;

    document.getElementById("kp-index").textContent = kp_index[0];
    document.getElementById("solar-flare").textContent = solar_flare[0];
    document.getElementById("aurora").textContent = aurora[0];
    document.getElementById("solar-wind").textContent = solar_wind[0];
  } catch (error) {
    console.error("Error fetching space weather data:", error);
    document.querySelectorAll(".weather-value").forEach(el => {
      el.textContent = "N/A";
    });
  }
}

// Bookmark functionality
async function getBookmarks() {
  const result = await chrome.storage.local.get('apodBookmarks');
  return result.apodBookmarks || [];
}

async function toggleBookmark() {
  const bookmarks = await getBookmarks();
  const index = bookmarks.indexOf(currentApodDate);
  
  if (index === -1) {
    bookmarks.push(currentApodDate);
  } else {
    bookmarks.splice(index, 1);
  }

  await chrome.storage.local.set({ apodBookmarks: bookmarks });
  updateBookmarkButton(index === -1);
}

function updateBookmarkButton(isBookmarked) {
  const btn = document.getElementById('bookmark-btn');
  const icon = btn.querySelector('i');
  
  if (isBookmarked) {
    icon.className = 'fas fa-star';
    btn.classList.add('active');
  } else {
    icon.className = 'far fa-star';
    btn.classList.remove('active');
  }
}

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
  // Get date from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const date = urlParams.get('date');
  
  fetchAPOD(date);
  fetchSpaceWeather();

  // Setup bookmark button
  document.getElementById('bookmark-btn').addEventListener('click', toggleBookmark);
});