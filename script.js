// ======================================
// BUTTON-ONLY SECTION NAVIGATION
// ======================================

const sections = document.querySelectorAll(".page-section");
const navigationButtons = document.querySelectorAll("[data-section]");
const navButtons = document.querySelectorAll(".nav-button");

function openSection(sectionId) {
  const target = document.getElementById(sectionId);

  if (!target || !target.classList.contains("page-section")) {
    return;
  }

  sections.forEach(section => {
    section.hidden = section.id !== sectionId;
    section.classList.toggle("active", section.id === sectionId);
  });

  navButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionId
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

navigationButtons.forEach(button => {
  button.addEventListener("click", () => {
    openSection(button.dataset.section);
  });
});


// ======================================
// OUR MEMORIES - PHOTO GALLERY
// ======================================

const photoCards = document.querySelectorAll(".photo-card");
const photoViewer = document.getElementById("photo-viewer");
const enlargedPhoto = document.getElementById("enlarged-photo");

let currentPhoto = 0;

function showPhoto(index) {
  if (!photoCards.length) return;

  currentPhoto =
    (index + photoCards.length) % photoCards.length;

  const image = photoCards[currentPhoto].querySelector("img");

  enlargedPhoto.src = image.src;
  enlargedPhoto.alt = image.alt;

  photoViewer.hidden = false;
}

photoCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    showPhoto(index);
  });
});

document.getElementById("close-photo").addEventListener("click", () => {
  photoViewer.hidden = true;
});

document.getElementById("previous-photo").addEventListener("click", () => {
  showPhoto(currentPhoto - 1);
});

document.getElementById("next-photo").addEventListener("click", () => {
  showPhoto(currentPhoto + 1);
});


// ======================================
// LOVE LETTER - OPEN AND CLOSE
// ======================================

const envelope = document.getElementById("envelope");
const letterContent = document.getElementById("letter-content");

envelope.addEventListener("click", () => {
  letterContent.hidden = false;
  envelope.hidden = true;
});

document.getElementById("close-letter").addEventListener("click", () => {
  letterContent.hidden = true;
  envelope.hidden = false;
});


// ======================================
// LILY GARDEN - BLOOMING LILIES
// ======================================

const lilies = document.querySelectorAll(".lily-button");
const gardenMessage = document.getElementById("garden-message");

lilies.forEach((lily, index) => {
  lily.addEventListener("click", () => {
    const hasBloomed = lily.classList.toggle("bloomed");

    lily.setAttribute(
      "aria-pressed",
      hasBloomed ? "true" : "false"
    );

    const bloomedCount =
      document.querySelectorAll(".lily-button.bloomed").length;

    gardenMessage.textContent = hasBloomed
      ? `Lily ${index + 1} has bloomed.`
      : `Lily ${index + 1} is closed.`;

    if (bloomedCount === lilies.length) {
      gardenMessage.textContent = "All the lilies have bloomed.";
    }
  });
});


// ======================================
// DAYS TOGETHER - LIVE COUNTER
// Start date: August 14, 2025
// ======================================

const startDate = new Date(2025, 7, 14);

function updateCounter() {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();
  let days = today.getDate() - startDate.getDate();

  if (days < 0) {
    months--;

    const previousMonthDays = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();

    days += previousMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor(
    (today - startDate) / 86400000
  );

  document.getElementById("total-days").textContent =
    Math.max(0, totalDays).toLocaleString();

  document.getElementById("years").textContent =
    Math.max(0, years);

  document.getElementById("months").textContent =
    Math.max(0, months);

  document.getElementById("remaining-days").textContent =
    Math.max(0, days);
}

updateCounter();
setInterval(updateCounter, 60000);


// ======================================
// SECRET SURPRISE - GIFT BOX
// ======================================

const giftBox = document.getElementById("gift-box");
const surpriseMessage = document.getElementById("surprise-message");

giftBox.addEventListener("click", () => {
  const isOpening = surpriseMessage.hidden;

  surpriseMessage.hidden = !isOpening;
  giftBox.classList.toggle("opened", isOpening);

  giftBox.querySelector(".gift-label").textContent =
    isOpening ? "Close gift" : "Open gift";
});


// ======================================
// PHOTO VIEWER - KEYBOARD SUPPORT
// ======================================

document.addEventListener("keydown", event => {
  if (photoViewer.hidden) return;

  if (event.key === "Escape") {
    photoViewer.hidden = true;
  }

  if (event.key === "ArrowLeft") {
    showPhoto(currentPhoto - 1);
  }

  if (event.key === "ArrowRight") {
    showPhoto(currentPhoto + 1);
  }
});


// ======================================
// INITIAL PAGE
// ======================================

openSection("home");
