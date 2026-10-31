"use strict";

(() => {

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  /* ======================================
     1. NAVIGATION
  ====================================== */

  const home = $("#home");
  const siteHeader = $("#siteHeader");

  const pages = $$(".page-section");
  const navButtons = $$(".nav-button");

  function showPage(id) {

    if (id === "home") {

      siteHeader.hidden = true;
      home.hidden = false;

      pages.forEach(page => {
        page.hidden = true;
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }

    const target = document.getElementById(id);

    if (!target || !pages.includes(target)) {
      return;
    }

    home.hidden = true;
    siteHeader.hidden = false;

    pages.forEach(page => {
      page.hidden = page !== target;
    });

    navButtons.forEach(button => {

      const active = button.dataset.page === id;

      button.classList.toggle("active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }

    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  $("#openSite").addEventListener("click", () => {
    showPage("playlist");
  });


  $("#navigation").addEventListener("click", event => {

    const button = event.target.closest("[data-page]");

    if (!button) return;

    showPage(button.dataset.page);

  });


  $$('[data-go="home"]').forEach(link => {

    link.addEventListener("click", event => {

      event.preventDefault();

      showPage("home");

    });

  });



  /* ======================================
     2. YOUTUBE PLAYER
  ====================================== */

  const songPlayer = $("#songPlayer");

  function sendPlayerCommand(command) {

    if (!songPlayer?.contentWindow) {
      return;
    }

    songPlayer.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: []
      }),
      "https://www.youtube-nocookie.com"
    );

  }


  $("#playSong").addEventListener("click", () => {
    sendPlayerCommand("playVideo");
  });


  $("#pauseSong").addEventListener("click", () => {
    sendPlayerCommand("pauseVideo");
  });



  /* ======================================
     3. LOVE LETTER
  ====================================== */

  const envelope = $("#envelope");
  const letterContent = $("#letterContent");
  const openLetterButton = $("#openLetter");


  openLetterButton.addEventListener("click", () => {

    envelope.classList.add("open");

    openLetterButton.hidden = true;

    window.setTimeout(() => {

      letterContent.hidden = false;

      letterContent.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 420);

  });


  $("#closeLetter").addEventListener("click", () => {

    letterContent.hidden = true;

    envelope.classList.remove("open");

    openLetterButton.hidden = false;

  });



  /* ======================================
     4. ANNIVERSARY COUNTER
     Starting date: August 14, 2025
  ====================================== */

  const relationshipStart = new Date(2025, 7, 14);


  function addMonthsClamped(date, amount) {

    const result = new Date(
      date.getFullYear(),
      date.getMonth() + amount,
      1
    );

    const finalDay = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0
    ).getDate();

    result.setDate(
      Math.min(date.getDate(), finalDay)
    );

    return result;

  }


  function updateCounter() {

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const totalDays = Math.max(
      0,
      Math.floor(
        (today - relationshipStart) / 86400000
      )
    );


    let elapsedMonths = Math.max(
      0,
      (today.getFullYear() - relationshipStart.getFullYear()) * 12
      + today.getMonth()
      - relationshipStart.getMonth()
    );


    let lastAnniversary = addMonthsClamped(
      relationshipStart,
      elapsedMonths
    );


    if (lastAnniversary > today) {

      elapsedMonths--;

      lastAnniversary = addMonthsClamped(
        relationshipStart,
        elapsedMonths
      );

    }


    const elapsedYears = Math.floor(
      elapsedMonths / 12
    );

    const remainingMonths = elapsedMonths % 12;

    const remainingDays = Math.max(
      0,
      Math.floor(
        (today - lastAnniversary) / 86400000
      )
    );


    $("#totalDays").textContent =
      totalDays.toLocaleString();

    $("#years").textContent = elapsedYears;

    $("#months").textContent = remainingMonths;

    $("#days").textContent = remainingDays;

  }


  updateCounter();



  /* ======================================
     5. LILY GARDEN
  ====================================== */

  const lilies = $$(".lily-plant");

  const gardenPopup = $("#gardenPopup");

  const bloomCount = $("#bloomCount");

  let popupTimer = null;


  function updateBloomCount() {

    const bloomed = lilies.filter(lily =>
      lily.classList.contains("bloomed")
    ).length;


    bloomCount.textContent =
      `${bloomed} of ${lilies.length} lilies bloomed`;

    return bloomed;

  }


  lilies.forEach(lily => {

    lily.addEventListener("click", () => {

      if (lily.classList.contains("bloomed")) {
        return;
      }

      lily.classList.add("bloomed");

      lily.setAttribute("aria-pressed", "true");

      const count = updateBloomCount();


      if (count === lilies.length) {

        window.clearTimeout(popupTimer);

        popupTimer = window.setTimeout(() => {

          gardenPopup.hidden = false;

        }, 850);

      }

    });

  });


  function closeGardenPopup() {
    gardenPopup.hidden = true;
  }


  $("#closeGardenPopup").addEventListener(
    "click",
    closeGardenPopup
  );


  gardenPopup.addEventListener("click", event => {

    if (event.target === gardenPopup) {
      closeGardenPopup();
    }

  });


  $("#resetGarden").addEventListener("click", () => {

    window.clearTimeout(popupTimer);

    lilies.forEach(lily => {

      lily.classList.remove("bloomed");

      lily.setAttribute("aria-pressed", "false");

    });

    updateBloomCount();

    closeGardenPopup();

  });


  updateBloomCount();



  /* ======================================
     6. IMAGE DATABASE
     Saves uploaded images in this browser.
  ====================================== */

  const DB_NAME = "monthsary-scrapbook-media";
  const DB_STORE = "images";

  let dbPromise = null;


  function openDatabase() {

    if (!("indexedDB" in window)) {
      return Promise.resolve(null);
    }

    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise(resolve => {

      let request;

      try {

        request = indexedDB.open(DB_NAME, 1);

      } catch (error) {

        resolve(null);

        return;

      }


      request.onupgradeneeded = () => {

        const db = request.result;

        if (!db.objectStoreNames.contains(DB_STORE)) {

          db.createObjectStore(DB_STORE);

        }

      };


      request.onsuccess = () => {
        resolve(request.result);
      };


      request.onerror = () => {
        resolve(null);
      };


      request.onblocked = () => {
        resolve(null);
      };

    });

    return dbPromise;

  }


  async function saveLocalImage(key, blob) {

    const db = await openDatabase();

    if (!db) return false;

    return new Promise(resolve => {

      const transaction = db.transaction(
        DB_STORE,
        "readwrite"
      );

      transaction.objectStore(DB_STORE).put(
        blob,
        key
      );

      transaction.oncomplete = () => resolve(true);

      transaction.onerror = () => resolve(false);

      transaction.onabort = () => resolve(false);

    });

  }


  async function getLocalImage(key) {

    const db = await openDatabase();

    if (!db) return null;

    return new Promise(resolve => {

      const request = db
        .transaction(DB_STORE, "readonly")
        .objectStore(DB_STORE)
        .get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        resolve(null);
      };

    });

  }


  const objectUrls = new Map();


  function setImageSource(image, blob, key) {

    const oldUrl = objectUrls.get(key);

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    const url = URL.createObjectURL(blob);

    objectUrls.set(key, url);

    image.src = url;
    image.hidden = false;


    const placeholder = image.parentElement.querySelector(
      ".memory-empty, .artwork-empty"
    );

    if (placeholder) {
      placeholder.hidden = true;
    }


    const memoryCard = image.closest(".memory-card");

    if (memoryCard) {
      memoryCard.classList.add("has-image");
    }

  }



  /* ======================================
     7. MEMORY GALLERY
  ====================================== */

  const memoryCards = $$("[data-memory-card]");

  const memoryImages = memoryCards.map(card =>
    $("img", card)
  );


  memoryImages.forEach((image, index) => {

    const card = memoryCards[index];


    image.addEventListener("load", () => {

      if (image.naturalWidth > 0) {

        card.classList.add("has-image");

      }

    });


    image.addEventListener("error", () => {

      card.classList.remove("has-image");

    });


    if (image.complete && image.naturalWidth > 0) {

      card.classList.add("has-image");

    }

  });


  /* Restore previously uploaded pictures */

  async function restoreLocalImages() {

    for (let index = 0; index < memoryImages.length; index++) {

      const blob = await getLocalImage(
        `memory-${index}`
      );

      if (blob) {

        setImageSource(
          memoryImages[index],
          blob,
          `memory-${index}`
        );

      }

    }


    const characterIds = [
      "woodstock",
      "fifi",
      "doghouse"
    ];


    for (const id of characterIds) {

      const blob = await getLocalImage(
        `character-${id}`
      );

      if (blob) {

        applyCharacterImage(id, blob, false);

      }

    }

  }


  /* Upload memory photos */

  $$("[data-memory-upload]").forEach(input => {

    input.addEventListener("change", async () => {

      const file = input.files?.[0];

      if (!file) return;


      if (!file.type.startsWith("image/")) {

        alert("Please choose an image file.");

        input.value = "";

        return;

      }


      const index = Number(
        input.dataset.memoryUpload
      );


      if (
        !Number.isInteger(index) ||
        !memoryImages[index]
      ) {
        return;
      }


      setImageSource(
        memoryImages[index],
        file,
        `memory-${index}`
      );

      await saveLocalImage(
        `memory-${index}`,
        file
      );

    });

  });
    /* ======================================
     8. PHOTO VIEWER
  ====================================== */

  const photoViewer = $("#photoViewer");
  const expandedPhoto = $("#expandedPhoto");

  let currentPhotoIndex = 0;


  function availablePhotoIndexes() {

    return memoryImages
      .map((image, index) => ({
        image,
        index
      }))
      .filter(item =>
        item.image.complete &&
        item.image.naturalWidth > 0
      )
      .map(item => item.index);

  }


  function showPhoto(index) {

    const available = availablePhotoIndexes();

    if (!available.length) {
      return;
    }

    const position = available.indexOf(index);

    if (position < 0) {
      return;
    }

    currentPhotoIndex = available[position];

    expandedPhoto.src =
      memoryImages[currentPhotoIndex].src;

    photoViewer.hidden = false;

  }


  $$(".memory-open").forEach(button => {

    button.addEventListener("click", () => {

      const index = Number(button.dataset.photo);

      if (memoryImages[index]?.naturalWidth) {

        showPhoto(index);

      }

    });

  });


  function movePhoto(direction) {

    const available = availablePhotoIndexes();

    if (!available.length) {
      return;
    }

    const position = available.indexOf(
      currentPhotoIndex
    );

    const next =
      (position + direction + available.length) %
      available.length;

    showPhoto(available[next]);

  }


  $("#previousPhoto").addEventListener("click", () => {
    movePhoto(-1);
  });


  $("#nextPhoto").addEventListener("click", () => {
    movePhoto(1);
  });


  function closePhotoViewer() {

    photoViewer.hidden = true;
    expandedPhoto.src = "";

  }


  $("#closeViewer").addEventListener(
    "click",
    closePhotoViewer
  );


  photoViewer.addEventListener("click", event => {

    if (event.target === photoViewer) {
      closePhotoViewer();
    }

  });



  /* ======================================
     9. SNOOPY SCENE TABS
  ====================================== */

  const snoopyTabs = $$(".snoopy-tab");

  const snoopyScenes = $$(".snoopy-scene");


  snoopyTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const id = tab.dataset.scene;


      snoopyTabs.forEach(item => {

        const selected = item === tab;

        item.classList.toggle("active", selected);

        item.setAttribute(
          "aria-selected",
          String(selected)
        );

      });


      snoopyScenes.forEach(scene => {

        const selected =
          scene.id === `scene-${id}`;

        scene.hidden = !selected;

        scene.classList.toggle(
          "active",
          selected
        );

      });

    });

  });



  /* ======================================
     10. SNOOPY IMAGE UPLOADS
  ====================================== */

  function applyCharacterImage(id, blob, save = true) {

    const image = document.getElementById(
      `${id}Image`
    );

    if (!image || !blob) {
      return;
    }


    const key = `character-${id}`;

    const oldUrl = objectUrls.get(key);

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }


    const url = URL.createObjectURL(blob);

    objectUrls.set(key, url);


    image.src = url;
    image.hidden = false;


    const empty = image.parentElement.querySelector(
      ".artwork-empty"
    );

    if (empty) {
      empty.hidden = true;
    }


    if (save) {
      saveLocalImage(key, blob);
    }

  }


  $$("[data-character]").forEach(input => {

    input.addEventListener("change", () => {

      const file = input.files?.[0];

      if (!file) {
        return;
      }


      if (!file.type.startsWith("image/")) {

        alert("Please choose an image file.");

        input.value = "";

        return;

      }


      applyCharacterImage(
        input.dataset.character,
        file
      );

    });

  });



  /* ======================================
     11. FLOATING HEARTS
  ====================================== */

  $$("[data-heart-target]").forEach(button => {

    button.addEventListener("click", () => {

      const layer = document.getElementById(
        button.dataset.heartTarget
      );

      if (!layer) {
        return;
      }


      layer.innerHTML = "";


      ["♡", "♥", "♡", "♥", "♡"].forEach(
        (symbol, index) => {

          const heart = document.createElement("span");

          heart.className = "float-heart";
          heart.textContent = symbol;

          heart.style.left =
            `${16 + index * 16}%`;

          heart.style.animationDelay =
            `${index * 90}ms`;


          layer.appendChild(heart);


          window.setTimeout(() => {
            heart.remove();
          }, 2100);

        }
      );

    });

  });



  /* ======================================
     12. DOGHOUSE INTERACTION
  ====================================== */

  const doghouse = $("#doghouseIllustration");

  const doghouseButton = $("#openDoghouse");


  doghouseButton.addEventListener("click", () => {

    const isOpen =
      doghouse.classList.toggle("opened");

    doghouseButton.textContent = isOpen
      ? "Close the doghouse"
      : "Open the doghouse";

  });



  /* ======================================
     13. SECRET GIFT
  ====================================== */

  const giftButton = $("#giftButton");

  const secretMessage = $("#secretMessage");


  giftButton.addEventListener("click", () => {

    giftButton.classList.add("opened");

    giftButton.setAttribute(
      "aria-expanded",
      "true"
    );

    secretMessage.hidden = false;

    giftButton.disabled = true;

    giftButton.setAttribute(
      "aria-label",
      "Gift opened"
    );

  });



  /* ======================================
     14. KEYBOARD CONTROLS
  ====================================== */

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      closePhotoViewer();

      closeGardenPopup();

    }


    if (
      photoViewer.hidden === false &&
      event.key === "ArrowRight"
    ) {

      movePhoto(1);

    }


    if (
      photoViewer.hidden === false &&
      event.key === "ArrowLeft"
    ) {

      movePhoto(-1);

    }

  });



  /* ======================================
     15. RESTORE SAVED PHOTOS
  ====================================== */

  restoreLocalImages();


})();
