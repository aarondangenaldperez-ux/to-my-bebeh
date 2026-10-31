const openButton = document.getElementById("openButton");
const navigation = document.getElementById("navigation");
const mainContent = document.getElementById("mainContent");

function showSection(sectionId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");

  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionId
    );
  });
}

openButton.addEventListener("click", () => {
  document.getElementById("home").classList.remove("active");
  navigation.classList.remove("hidden");
  mainContent.classList.remove("hidden");
  showSection("memories");
});

document.querySelectorAll(".nav-button").forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

// Photo gallery uploads
document.querySelectorAll(".photo-slot input").forEach(input => {
  input.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
      const slot = event.target.parentElement;
      let img = slot.querySelector("img");

      if (!img) {
        img = document.createElement("img");
        slot.appendChild(img);
      }

      img.src = e.target.result;
      slot.querySelector("span").style.display = "none";
    };

    reader.readAsDataURL(file);
  });
});

// Love letter
document.getElementById("letterButton").addEventListener("click", () => {
  document.getElementById("envelope").classList.add("hidden");
  document.getElementById("letterContent").classList.remove("hidden");
});

// Lily garden
const lilies = document.querySelectorAll(".lily");

lilies.forEach(lily => {
  lily.addEventListener("click", () => {
    lily.classList.add("bloomed");

    const allBloomed = [...lilies].every(item =>
      item.classList.contains("bloomed")
    );

    if (allBloomed) {
      document.getElementById("gardenMessage").classList.remove("hidden");
    }
  });
});

// Calendar counter
function updateCounter() {
  const startDate = new Date(2025, 7, 14);
  const today = new Date();

  const totalDays = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
    startDate) / 86400000
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

  document.getElementById("totalDays").textContent =
    `${totalDays.toLocaleString()} days`;

  document.getElementById("timeTogether").textContent =
    `${years} years, ${months} months, and ${days} days`;
}

updateCounter();

// Secret gift
document.getElementById("giftButton").addEventListener("click", () => {
  document.getElementById("giftButton").classList.add("hidden");
  document.getElementById("secretMessage").classList.remove("hidden");
});

// Music: YouTube player
let youtubeReady = false;
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtubePlayer", {
    height: "0",
    width: "0",
    videoId: "REPLACE_WITH_OFFICIAL_VIDEO_ID",
    playerVars: {
      playsinline: 1
    },
    events: {
      onReady: () => {
        youtubeReady = true;
      }
    }
  });
}

document.getElementById("playButton").addEventListener("click", () => {
  if (youtubeReady) player.playVideo();
});

document.getElementById("pauseButton").addEventListener("click", () => {
  if (youtubeReady) player.pauseVideo();
});

const youtubeScript = document.createElement("script");
youtubeScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(youtubeScript);
