document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     PAGE NAVIGATION
  ===================================== */

  const homeScreen = document.getElementById("home");
  const site = document.getElementById("site");
  const openSiteButton = document.getElementById("openSite");
  const navigation = document.getElementById("navigation");

  const sections = document.querySelectorAll(".page-section");
  const navigationButtons = document.querySelectorAll("[data-page]");

  function showPage(pageName) {

    if (pageName === "home") {
      site.classList.add("hidden");
      homeScreen.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const selectedSection = document.getElementById(pageName);

    if (!selectedSection) {
      console.warn("Page not found:", pageName);
      return;
    }

    homeScreen.classList.add("hidden");
    site.classList.remove("hidden");

    sections.forEach(section => {
      section.classList.add("hidden");
    });

    selectedSection.classList.remove("hidden");

    navigationButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  openSiteButton.addEventListener("click", () => {
    showPage("playlist");
  });

  navigation.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");

    if (!button) return;

    showPage(button.dataset.page);
  });


  /* =====================================
     LETTER OPEN / CLOSE
  ===================================== */

  const openLetterButton = document.getElementById("openLetter");
  const letterText = document.getElementById("letterText");
  const envelope = document.getElementById("envelope");

  openLetterButton.addEventListener("click", () => {

    const isHidden = letterText.classList.contains("hidden");

    letterText.classList.toggle("hidden");

    if (isHidden) {
      openLetterButton.textContent = "Close Letter";
      envelope.classList.add("letter-open");
    } else {
      openLetterButton.textContent = "Open Letter";
      envelope.classList.remove("letter-open");
    }

  });


  /* =====================================
     SONG PLAY / PAUSE
  ===================================== */

  const songPlayer = document.getElementById("songPlayer");
  const playSongButton = document.getElementById("playSong");
  const pauseSongButton = document.getElementById("pauseSong");

  function sendSongCommand(command) {

    songPlayer.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: []
      }),
      "*"
    );

  }

  playSongButton.addEventListener("click", () => {
    sendSongCommand("playVideo");
  });

  pauseSongButton.addEventListener("click", () => {
    sendSongCommand("pauseVideo");
  });


  /* =====================================
     ANNIVERSARY COUNTER
     START DATE: AUGUST 14, 2025
  ===================================== */

  const startDate = new Date(2025, 7, 14);

  function updateCounter() {

    const today = new Date();

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const totalMilliseconds = todayDate - startDate;

    const totalDays = Math.max(
      0,
      Math.floor(totalMilliseconds / 86400000)
    );

    let years =
      todayDate.getFullYear() - startDate.getFullYear();

    let months =
      todayDate.getMonth() - startDate.getMonth();

    let days =
      todayDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;

      const previousMonthDays = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
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


  /* =====================================
     MEMORY PHOTO UPLOADS
  ===================================== */

  const memoryFiles = document.querySelectorAll("[data-memory-file]");
  const memoryPreviews = document.querySelectorAll("[data-memory-index]");

  const memoryImages = new Array(6).fill(null);
  let currentMemoryIndex = 0;

  const photoViewer = document.getElementById("photoViewer");
  const largePhoto = document.getElementById("largePhoto");

  function openMemoryViewer(index) {

    if (!memoryImages[index]) return;

    currentMemoryIndex = index;
    largePhoto.src = memoryImages[index];

    photoViewer.classList.remove("hidden");
    document.body.style.overflow = "hidden";

  }

  function updateViewerImage() {

    if (!memoryImages[currentMemoryIndex]) return;

    largePhoto.src = memoryImages[currentMemoryIndex];

  }

  memoryFiles.forEach(input => {

    input.addEventListener("change", event => {

      const file = event.target.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        input.value = "";
        return;
      }

      const index = Number(input.dataset.memoryFile);
      const reader = new FileReader();

      reader.onload = () => {

        memoryImages[index] = reader.result;

        const preview = document.querySelector(
          `.memory-preview[data-memory-index="${index}"]`
        );

        const image = preview.querySelector(".memory-image");
        const placeholder = preview.querySelector(".memory-placeholder");

        image.src = reader.result;
        image.hidden = false;
        placeholder.hidden = true;

      };

      reader.readAsDataURL(file);

    });

  });

  memoryPreviews.forEach(button => {

    button.addEventListener("click", () => {

      const index = Number(button.dataset.memoryIndex);
      openMemoryViewer(index);

    });

  });

  function closeMemoryViewer() {

    photoViewer.classList.add("hidden");
    document.body.style.overflow = "";

  }

  document.getElementById("closePhoto").addEventListener(
    "click",
    closeMemoryViewer
  );

  document.getElementById("viewerBackdrop").addEventListener(
    "click",
    closeMemoryViewer
  );

  document.getElementById("previousPhoto").addEventListener("click", () => {

    for (let step = 1; step <= memoryImages.length; step++) {

      const index =
        (currentMemoryIndex - step + memoryImages.length) %
        memoryImages.length;

      if (memoryImages[index]) {
        currentMemoryIndex = index;
        updateViewerImage();
        return;
      }

    }

  });

  document.getElementById("nextPhoto").addEventListener("click", () => {

    for (let step = 1; step <= memoryImages.length; step++) {

      const index =
        (currentMemoryIndex + step) % memoryImages.length;

      if (memoryImages[index]) {
        currentMemoryIndex = index;
        updateViewerImage();
        return;
      }

    }

  });

  document.addEventListener("keydown", event => {

    if (photoViewer.classList.contains("hidden")) return;

    if (event.key === "Escape") {
      closeMemoryViewer();
    }

    if (event.key === "ArrowLeft") {
      document.getElementById("previousPhoto").click();
    }

    if (event.key === "ArrowRight") {
      document.getElementById("nextPhoto").click();
    }

  });


  /* =====================================
     LILY GARDEN
  ===================================== */

  const lilies = document.querySelectorAll("[data-lily]");
  const gardenReward = document.getElementById("gardenReward");

  const closeGardenReward =
    document.getElementById("closeGardenReward");

  const resetGardenButton =
    document.getElementById("resetGarden");

  let bloomedLilies = 0;
  let rewardShown = false;

  lilies.forEach(lily => {

    lily.addEventListener("click", () => {

      if (lily.classList.contains("bloomed")) return;

      lily.classList.add("bloomed");
      bloomedLilies++;

      if (bloomedLilies === lilies.length && !rewardShown) {
        rewardShown = true;
        gardenReward.classList.remove("hidden");
      }

    });

  });

  closeGardenReward.addEventListener("click", () => {
    gardenReward.classList.add("hidden");
  });

  resetGardenButton.addEventListener("click", () => {

    lilies.forEach(lily => {
      lily.classList.remove("bloomed");
    });

    bloomedLilies = 0;
    rewardShown = false;

    gardenReward.classList.add("hidden");

  });
    /* =====================================
     SNOOPY CORNER TABS
  ===================================== */

  const comicTabs = document.querySelectorAll("[data-scene]");

  const comicScenes = {
    woodstock: document.getElementById("scene-woodstock"),
    fifi: document.getElementById("scene-fifi"),
    doghouse: document.getElementById("scene-doghouse")
  };

  comicTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const selectedScene = tab.dataset.scene;

      comicTabs.forEach(button => {
        button.classList.toggle("active", button === tab);
      });

      Object.entries(comicScenes).forEach(([name, scene]) => {
        scene.classList.toggle("hidden", name !== selectedScene);
      });

    });

  });


  /* =====================================
     WOODSTOCK AND FIFI PHOTO UPLOADS
  ===================================== */

  const characterInputs = document.querySelectorAll(
    "[data-character-image]"
  );

  characterInputs.forEach(input => {

    input.addEventListener("change", event => {

      const file = event.target.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        input.value = "";
        return;
      }

      const characterName = input.dataset.characterImage;

      const image = document.getElementById(
        characterName + "Image"
      );

      const placeholder = input
        .closest(".side-character")
        .querySelector(".character-placeholder");

      const reader = new FileReader();

      reader.onload = () => {

        image.src = reader.result;
        image.hidden = false;
        placeholder.hidden = true;

      };

      reader.readAsDataURL(file);

    });

  });


  /* =====================================
     SNOOPY CORNER HEART COUNTERS
  ===================================== */

  const heartButtons = document.querySelectorAll("[data-hearts]");

  const heartCounts = {
    woodstock: 0,
    fifi: 0
  };

  heartButtons.forEach(button => {

    button.addEventListener("click", () => {

      const character = button.dataset.hearts;

      heartCounts[character]++;

      const counter = document.getElementById(
        character + "Hearts"
      );

      counter.textContent = heartCounts[character];

      button.classList.add("heart-clicked");

      setTimeout(() => {
        button.classList.remove("heart-clicked");
      }, 250);

    });

  });


  /* =====================================
     SNOOPY DOGHOUSE
  ===================================== */

  const doghouse = document.getElementById("doghouse");

  const openDoghouseButton =
    document.getElementById("openDoghouse");

  openDoghouseButton.addEventListener("click", () => {

    const isOpen = doghouse.classList.toggle("open");

    openDoghouseButton.textContent = isOpen
      ? "Close doghouse ♡"
      : "Open doghouse ♡";

  });


  /* =====================================
     SECRET GIFT
  ===================================== */

  const giftBox = document.getElementById("giftBox");
  const secretMessage = document.getElementById("secretMessage");

  giftBox.addEventListener("click", () => {

    const isOpened = giftBox.classList.toggle("opened");

    secretMessage.classList.toggle("hidden", !isOpened);

  });


  /* =====================================
     INITIAL PAGE STATE
  ===================================== */

  homeScreen.classList.remove("hidden");
  site.classList.add("hidden");

});
