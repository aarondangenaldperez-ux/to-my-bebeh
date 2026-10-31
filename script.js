// SECTION NAVIGATION

const sections = document.querySelectorAll(".page-section");
const navigationButtons = document.querySelectorAll("[data-section]");

function openSection(sectionId) {
  sections.forEach(section => {
    section.hidden = section.id !== sectionId;
  });

  navigationButtons.forEach(button => {
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


// PHOTO GALLERY

const photoButtons = document.querySelectorAll(".memory-photo");
const photoViewer = document.getElementById("photoViewer");
const expandedPhoto = document.getElementById("expandedPhoto");
const closeViewer = document.getElementById("closeViewer");
const previousPhoto = document.getElementById("previousPhoto");
const nextPhoto = document.getElementById("nextPhoto");

const photoSources = Array.from(photoButtons).map(button => {
  return button.querySelector("img").getAttribute("src");
});

let currentPhotoIndex = 0;

function showPhoto(index) {
  currentPhotoIndex =
    (index + photoSources.length) % photoSources.length;

  expandedPhoto.src = photoSources[currentPhotoIndex];
}

photoButtons.forEach(button => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.photo);
    showPhoto(index);
    photoViewer.hidden = false;
  });
});

closeViewer.addEventListener("click", () => {
  photoViewer.hidden = true;
});

previousPhoto.addEventListener("click", () => {
  showPhoto(currentPhotoIndex - 1);
});

nextPhoto.addEventListener("click", () => {
  showPhoto(currentPhotoIndex + 1);
});


// LOVE LETTER

const envelope = document.getElementById("envelope");
const openLetterButton = document.getElementById("openLetter");
const closeLetterButton = document.getElementById("closeLetter");
const letterContent = document.getElementById("letterContent");

openLetterButton.addEventListener("click", () => {
  envelope.classList.add("open");

  setTimeout(() => {
    letterContent.hidden = false;
    openLetterButton.hidden = true;
  }, 450);
});

closeLetterButton.addEventListener("click", () => {
  letterContent.hidden = true;
  openLetterButton.hidden = false;
  envelope.classList.remove("open");
});


// LILY GARDEN

const lilies = document.querySelectorAll(".lily-plant");
const gardenPopup = document.getElementById("gardenPopup");
const closeGardenPopup = document.getElementById("closeGardenPopup");

let bloomedLilies = new Set();
let gardenPopupShown = false;

lilies.forEach(lily => {
  lily.addEventListener("click", () => {
    const lilyIndex = Number(lily.dataset.lily);

    if (lily.classList.contains("bloomed")) {
      return;
    }

    lily.classList.add("bloomed");
    lily.setAttribute("aria-pressed", "true");
    bloomedLilies.add(lilyIndex);

    if (
      bloomedLilies.size === lilies.length &&
      !gardenPopupShown
    ) {
      gardenPopupShown = true;

      setTimeout(() => {
        gardenPopup.hidden = false;
      }, 1000);
    }
  });
});

closeGardenPopup.addEventListener("click", () => {
  gardenPopup.hidden = true;
});

gardenPopup.addEventListener("click", event => {
  if (event.target === gardenPopup) {
    gardenPopup.hidden = true;
  }
});


// PLAYLIST

const songAudio = document.getElementById("songAudio");
const playSongButton = document.getElementById("playSong");
const pauseSongButton = document.getElementById("pauseSong");
const audioStatus = document.getElementById("audioStatus");

playSongButton.addEventListener("click", async () => {
  try {
    await songAudio.play();
    audioStatus.textContent = "";
  } catch (error) {
    audioStatus.textContent =
      "Add your authorized song audio file to the audio folder.";
  }
});

pauseSongButton.addEventListener("click", () => {
  songAudio.pause();
});


// CALENDAR COUNTER

const relationshipStart = new Date(2025, 7, 14);

function updateCounter() {
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const totalMilliseconds =
    startOfToday - relationshipStart;

  const totalDays = Math.max(
    0,
    Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24))
  );

  let years =
    today.getFullYear() - relationshipStart.getFullYear();

  let months =
    today.getMonth() - relationshipStart.getMonth();

  let days =
    today.getDate() - relationshipStart.getDate();

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

  document.getElementById("totalDays").textContent = totalDays;
  document.getElementById("years").textContent = years;
  document.getElementById("months").textContent = months;
  document.getElementById("days").textContent = days;
}

updateCounter();


// SECRET GIFT

const giftButton = document.getElementById("giftButton");
const secretMessage = document.getElementById("secretMessage");

giftButton.addEventListener("click", () => {
  giftButton.classList.add("opened");
  secretMessage.hidden = false;
  giftButton.disabled = true;
});
