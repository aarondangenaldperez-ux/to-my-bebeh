// =====================================
// OUR MEMORIES - PHOTO GALLERY
// =====================================

const photoCards = document.querySelectorAll(".photo-card img");
const photoViewer = document.getElementById("photo-viewer");
const enlargedPhoto = document.getElementById("enlarged-photo");

let currentPhoto = 0;

function showPhoto(index) {
  if (!photoCards.length) return;

  currentPhoto = (index + photoCards.length) % photoCards.length;
  enlargedPhoto.src = photoCards[currentPhoto].src;
  enlargedPhoto.alt = photoCards[currentPhoto].alt;
  photoViewer.hidden = false;
}

photoCards.forEach((photo, index) => {
  photo.parentElement.addEventListener("click", () => showPhoto(index));
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


// =====================================
// LOVE LETTER - OPEN ENVELOPE
// =====================================

const envelope = document.getElementById("envelope");
const letterContent = document.getElementById("letter-content");

envelope.addEventListener("click", () => {
  const isOpening = letterContent.hidden;

  letterContent.hidden = !isOpening;
  envelope.querySelector(".envelope-label").textContent =
    isOpening ? "Close letter" : "Open me";

  if (isOpening) {
    letterContent.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
});


// =====================================
// LILY GARDEN - BLOOMING FLOWERS
// =====================================

document.querySelectorAll(".lily").forEach((lily) => {
  lily.addEventListener("click", () => {
    lily.classList.toggle("bloomed");
    lily.textContent = lily.classList.contains("bloomed") ? "🌸" : "🌷";
  });
});


// =====================================
// DAYS TOGETHER - LIVE COUNTER
// Relationship start: August 14, 2025
// =====================================

const startDate = new Date(2025, 7, 14);

function updateCounter() {
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
      startDate) / 86400000
  );

  document.getElementById("total-days").textContent =
    Math.max(0, totalDays).toLocaleString();

  document.getElementById("years").textContent = Math.max(0, years);
  document.getElementById("months").textContent = Math.max(0, months);
  document.getElementById("remaining-days").textContent =
    Math.max(0, days);
}

updateCounter();
setInterval(updateCounter, 60000);


// =====================================
// SECRET SURPRISE - GIFT BOX
// =====================================

const giftBox = document.getElementById("gift-box");
const surpriseMessage = document.getElementById("surprise-message");

giftBox.addEventListener("click", () => {
  const isOpening = surpriseMessage.hidden;

  surpriseMessage.hidden = !isOpening;
  giftBox.querySelector("small").textContent =
    isOpening ? "Close gift" : "Tap to open";

  if (isOpening) {
    surpriseMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
});


// =====================================
// FALLING PINK PETALS AND HEARTS
// =====================================

function createFallingDecoration() {
  const decoration = document.createElement("span");

  const symbols = ["🌸", "♡", "🌷"];
  decoration.textContent =
    symbols[Math.floor(Math.random() * symbols.length)];

  decoration.style.position = "fixed";
  decoration.style.left = Math.random() * 100 + "vw";
  decoration.style.top = "-30px";
  decoration.style.pointerEvents = "none";
  decoration.style.zIndex = "20";
  decoration.style.fontSize =
    (12 + Math.random() * 14) + "px";

  const duration = 5 + Math.random() * 5;

  decoration.style.transition =
    `transform ${duration}s linear, opacity ${duration}s linear`;

  document.body.appendChild(decoration);

  requestAnimationFrame(() => {
    decoration.style.transform =
      `translateY(${window.innerHeight + 60}px) rotate(360deg)`;
    decoration.style.opacity = "0";
  });

  setTimeout(() => decoration.remove(), duration * 1000);
}

setInterval(createFallingDecoration, 1200);
