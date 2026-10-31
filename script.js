// PAGE NAVIGATION

const pages = document.querySelectorAll(".page");
const navigation = document.getElementById("navigation");
const mainContent = document.getElementById("mainContent");

function showPage(pageId) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("openButton").addEventListener("click", () => {
  navigation.classList.remove("hidden");
  mainContent.classList.remove("hidden");
  showPage("memories");
});

document.querySelectorAll(".nav-button").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});


// MEMORIES: UPLOAD, SAVE, AND VIEW PHOTOS

const STORAGE_KEY = "monthsaryMemories";
const photoTiles = [...document.querySelectorAll(".photo-tile")];
let savedPhotos = [];

function displayPhoto(index, dataUrl) {
  const tile = photoTiles[index];
  if (!tile) return;

  const image = tile.querySelector("img");
  const plus = tile.querySelector(".upload-symbol");
  const viewButton = tile.querySelector(".view-photo");

  image.src = dataUrl;
  image.hidden = false;
  plus.hidden = true;
  viewButton.hidden = false;
}

function loadSavedPhotos() {
  try {
    savedPhotos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    savedPhotos = [];
  }

  photoTiles.forEach((tile, index) => {
    if (savedPhotos[index]) {
      displayPhoto(index, savedPhotos[index]);
    }
  });
}

// Compress photos so they take up less browser storage.
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read photo."));

    reader.onload = () => {
      const originalImage = new Image();

      originalImage.onerror = () => reject(new Error("Invalid image."));

      originalImage.onload = () => {
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / originalImage.width);

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(originalImage.width * scale);
        canvas.height = Math.round(originalImage.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(
          originalImage,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      originalImage.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

photoTiles.forEach((tile, index) => {
  const input = tile.querySelector("input");

  input.addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    try {
      const compressed = await compressPhoto(file);

      savedPhotos[index] = compressed;
      displayPhoto(index, compressed);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPhotos));
      } catch {
        // The photo still appears, but may not persist if browser
        // storage is full.
      }
    } catch (error) {
      console.error(error);
    }

    // Allows choosing the same photo again.
    event.target.value = "";
  });
});

loadSavedPhotos();


// PHOTO VIEWER

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
let currentPhotoIndex = 0;

function getAvailablePhotos() {
  return photoTiles
    .map((tile, index) => ({
      index,
      image: tile.querySelector("img")
    }))
    .filter(item => !item.image.hidden && item.image.src);
}

function openLightbox(index) {
  const available = getAvailablePhotos();
  if (!available.length) return;

  currentPhotoIndex = available.findIndex(item => item.index === index);
  if (currentPhotoIndex < 0) return;

  updateLightbox();
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function updateLightbox() {
  const available = getAvailablePhotos();
  if (!available.length) return;

  currentPhotoIndex =
    (currentPhotoIndex + available.length) % available.length;

  lightboxImage.src = available[currentPhotoIndex].image.src;
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

function movePhoto(direction) {
  const available = getAvailablePhotos();
  if (!available.length) return;

  currentPhotoIndex =
    (currentPhotoIndex + direction + available.length) %
    available.length;

  updateLightbox();
}

photoTiles.forEach((tile, index) => {
  tile.querySelector(".view-photo").addEventListener("click", () => {
    openLightbox(index);
  });
});

document.getElementById("closeLightbox").addEventListener(
  "click",
  closeLightbox
);

document.getElementById("previousPhoto").addEventListener(
  "click",
  () => movePhoto(-1)
);

document.getElementById("nextPhoto").addEventListener(
  "click",
  () => movePhoto(1)
);

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", event => {
  if (lightbox.classList.contains("hidden")) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") movePhoto(-1);
  if (event.key === "ArrowRight") movePhoto(1);
});


// LOVE LETTER

document.getElementById("letterButton").addEventListener("click", () => {
  document.getElementById("envelope").classList.add("hidden");
  document.getElementById("letterContent").classList.remove("hidden");
});


// LILY GARDEN

const lilies = document.querySelectorAll(".lily");
const gardenMessage = document.getElementById("gardenMessage");

lilies.forEach(lily => {
  lily.addEventListener("click", () => {
    lily.classList.add("bloomed");

    const everyLilyBloomed = [...lilies].every(item =>
      item.classList.contains("bloomed")
    );

    if (everyLilyBloomed) {
      gardenMessage.classList.remove("hidden");
    }
  });
});


// MUSIC PLAYER: DILAW - JANICE
// This embeds the official YouTube lyric video.
// The browser's own YouTube player handles playback.

const video = document.getElementById("youtubePlayer");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const record = document.querySelector(".record");

// Official video ID: -sNgBet587k
const videoURL = new URL(
  "https://www.youtube-nocookie.com/embed/-sNgBet587k"
);

videoURL.searchParams.set("enablejsapi", "1");
videoURL.searchParams.set("playsinline", "1");
videoURL.searchParams.set("rel", "0");
videoURL.searchParams.set("origin", window.location.origin);

video.src = videoURL.toString();

video.addEventListener("load", () => {
  playButton.disabled = false;
  pauseButton.disabled = false;
});

function sendVideoCommand(command) {
  if (!video.contentWindow) return;

  video.contentWindow.postMessage(
    JSON.stringify({
      event: "command",
      func: command,
      args: []
    }),
    "https://www.youtube-nocookie.com"
  );
}

playButton.addEventListener("click", () => {
  sendVideoCommand("playVideo");
  record.classList.add("playing");
});

pauseButton.addEventListener("click", () => {
  sendVideoCommand("pauseVideo");
  record.classList.remove("playing");
});


// CALENDAR: AUGUST 14, 2025

function updateCounter() {
  const startDate = new Date(Date.UTC(2025, 7, 14));

  // Use today's local calendar date.
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ));

  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((today - startDate) / oneDay);

  let cursor = new Date(startDate);
  let years = 0;
  let months = 0;

  // Count complete calendar months without guessing month lengths.
  while (true) {
    const nextMonth = new Date(Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth() + 1,
      14
    ));

    if (nextMonth > today) break;

    cursor = nextMonth;
    months++;

    if (months === 12) {
      years++;
      months = 0;
    }
  }

  const remainingDays = Math.floor((today - cursor) / oneDay);

  document.getElementById("totalDays").textContent =
    totalDays.toLocaleString("en-PH");

  document.getElementById("timeTogether").textContent =
    `${years} years, ${months} months, and ${remainingDays} days`;
}

updateCounter();


// SECRET GIFT

document.getElementById("giftButton").addEventListener("click", () => {
  document.getElementById("giftButton").classList.add("hidden");
  document.getElementById("secretMessage").classList.remove("hidden");
});
