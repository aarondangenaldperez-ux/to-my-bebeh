(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const snoopyPlayers = new WeakMap();
  let youtubeApiPromise = null;

  function loadYouTubeIframeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (youtubeApiPromise) return youtubeApiPromise;
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === "function") previousReady();
        resolve(window.YT);
      };
      let apiScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!apiScript) {
        apiScript = document.createElement("script");
        apiScript.src = "https://www.youtube.com/iframe_api";
        apiScript.async = true;
        apiScript.onerror = () => reject(new Error("The YouTube player could not be loaded."));
        document.head.appendChild(apiScript);
      }
    });
    return youtubeApiPromise;
  }

  function stopSnoopyVideo(playerElement, hide = true) {
    if (!playerElement) return;
    const activePlayer = snoopyPlayers.get(playerElement);
    if (activePlayer) {
      try { activePlayer.destroy(); } catch (error) { console.warn("Could not stop the embedded video cleanly.", error); }
      snoopyPlayers.delete(playerElement);
    }
    const frameContainer = $(".snoopy-video-frame", playerElement);
    if (frameContainer) {
      frameContainer.replaceChildren();
      const target = document.createElement("div");
      target.className = "snoopy-youtube-target";
      frameContainer.appendChild(target);
    }
    const message = $(".snoopy-personal-message", playerElement);
    if (message) message.hidden = true;
    if (hide) playerElement.hidden = true;
  }

  const home = $("#home");
  const site = $("#site");
  const pages = $$(".page-section");
  const navButtons = $$(".nav-button");
  const photoViewer = $("#photoViewer");
  const expandedPhoto = $("#expandedPhoto");
  const pageIds = new Set(["home", ...pages.map(page => page.id)]);

  let currentPage = pageIds.has(window.location.hash.slice(1))
    ? window.location.hash.slice(1)
    : "home";
  let currentPhotoIndex = 0;

  // The viewer is forcibly closed at startup, even if an old stylesheet
  // accidentally gives .photo-viewer its normal display value.
  function closePhotoViewer() {
    if (!photoViewer) return;
    photoViewer.hidden = true;
    photoViewer.classList.add("hidden");
    photoViewer.style.setProperty("display", "none", "important");
    photoViewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (expandedPhoto) {
      expandedPhoto.onload = null;
      expandedPhoto.onerror = null;
      expandedPhoto.removeAttribute("src");
    }
  }

  function openPhotoViewer() {
    if (!photoViewer || !expandedPhoto || !expandedPhoto.naturalWidth) {
      closePhotoViewer();
      return;
    }
    photoViewer.hidden = false;
    photoViewer.classList.remove("hidden");
    photoViewer.style.removeProperty("display");
    photoViewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function renderPage(pageId) {
    if (!pageIds.has(pageId)) return;
    closePhotoViewer();
    if (pageId !== "snoopy") {
      $$(".snoopy-video-player").forEach(player => stopSnoopyVideo(player));
    }

    if (pageId === "home") {
      site.hidden = true;
      home.hidden = false;
      navButtons.forEach(button => button.classList.remove("active"));
    } else {
      home.hidden = true;
      site.hidden = false;
      pages.forEach(page => { page.hidden = page !== document.getElementById(pageId); });
      navButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.go === pageId);
      });
    }

    currentPage = pageId;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateTo(pageId) {
    if (!pageIds.has(pageId)) return;
    if (pageId !== currentPage) {
      window.history.pushState({ monthsaryPage: pageId }, "", `#${pageId}`);
    }
    renderPage(pageId);
  }

  function goBack() {
    if (currentPage === "home") return;
    window.history.back();
  }

  // Browser Back/Forward and the visible Back button use the same page state.
  window.history.replaceState(
    { monthsaryPage: currentPage },
    "",
    `${window.location.pathname}${window.location.search}#${currentPage}`
  );

  window.addEventListener("popstate", event => {
    const statePage = event.state?.monthsaryPage;
    const hashPage = window.location.hash.slice(1);
    renderPage(pageIds.has(statePage) ? statePage : (pageIds.has(hashPage) ? hashPage : "home"));
  });

  // Close before any section is displayed; no empty image can launch the viewer.
  closePhotoViewer();
  renderPage(currentPage);

  // Opening the cover starts at the first section after the homepage.
  $("#openSite").addEventListener("click", () => navigateTo("playlist"));

  // One delegated handler keeps navigation predictable and avoids duplicate listeners.
  document.addEventListener("click", event => {
    const backTrigger = event.target.closest("[data-back]");
    if (backTrigger) {
      event.preventDefault();
      goBack();
      return;
    }
    const trigger = event.target.closest("[data-go]");
    if (!trigger) return;
    event.preventDefault();
    navigateTo(trigger.dataset.go);
  });

  // YouTube embedded player controls. The original selected video ID is preserved.
  const songPlayer = $("#songPlayer");
  function sendPlayerCommand(command) {
    if (!songPlayer?.contentWindow) return;
    songPlayer.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func: command,
      args: []
    }), "*");
  }
  $("#playSong").addEventListener("click", () => sendPlayerCommand("playVideo"));
  $("#pauseSong").addEventListener("click", () => sendPlayerCommand("pauseVideo"));

  // Letter: animate the envelope, then reveal the exact approved letter.
  const envelope = $("#envelope");
  const letterContent = $("#letterContent");
  const openLetterButton = $("#openLetter");
  openLetterButton.addEventListener("click", () => {
    envelope.classList.add("open");
    openLetterButton.hidden = true;
    letterContent.classList.remove("hidden");
    letterContent.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  $("#closeLetter").addEventListener("click", () => {
    letterContent.classList.add("hidden");
    openLetterButton.hidden = false;
    envelope.classList.remove("open");
  });

  // Gallery. The six original photos/photoN.jpg paths are kept intact.
  const photoButtons = $$(".memory-photo");
  function availablePhotoIndexes() {
    return photoButtons
      .map((button, index) => ({ button, index }))
      .filter(({ button }) => {
        const image = $("img", button);
        return image.complete && image.naturalWidth > 0;
      })
      .map(item => item.index);
  }

  function showPhoto(index) {
    const available = availablePhotoIndexes();
    if (!available.length || !photoViewer || !expandedPhoto) return;
    const position = available.indexOf(index);
    currentPhotoIndex = available[position >= 0 ? position : 0];

    const sourceImage = $("img", photoButtons[currentPhotoIndex]);
    const sourceUrl = sourceImage.currentSrc || sourceImage.src;
    if (!sourceUrl) return;

    expandedPhoto.onload = () => {
      if (expandedPhoto.naturalWidth > 0) openPhotoViewer();
      else closePhotoViewer();
    };
    expandedPhoto.onerror = closePhotoViewer;
    expandedPhoto.src = sourceUrl;

    // Cached images may already be complete before the load callback is attached.
    if (expandedPhoto.complete && expandedPhoto.naturalWidth > 0) openPhotoViewer();
  }

  photoButtons.forEach((button, index) => {
    const image = $("img", button);
    const updateImageState = () => {
      button.classList.toggle("image-ready", image.naturalWidth > 0);
      button.disabled = image.naturalWidth === 0;
    };
    image.addEventListener("load", updateImageState);
    image.addEventListener("error", updateImageState);
    if (image.complete) updateImageState();
    button.addEventListener("click", () => showPhoto(index));
  });

  $("#previousPhoto").addEventListener("click", () => {
    const available = availablePhotoIndexes();
    if (!available.length) return;
    const position = available.indexOf(currentPhotoIndex);
    showPhoto(available[(position - 1 + available.length) % available.length]);
  });

  $("#nextPhoto").addEventListener("click", () => {
    const available = availablePhotoIndexes();
    if (!available.length) return;
    const position = available.indexOf(currentPhotoIndex);
    showPhoto(available[(position + 1) % available.length]);
  });

  $("#closeViewer").addEventListener("click", closePhotoViewer);
  photoViewer.addEventListener("click", event => {
    if (event.target === photoViewer) closePhotoViewer();
  });

  // Upright pink lilies bloom individually. Completing all five opens the message.
  const lilies = $$(".lily-plant");
  const gardenPopup = $("#gardenPopup");
  const gardenProgress = $("#gardenProgress");
  const bloomed = new Set();
  let popupOpened = false;

  function updateGardenProgress() {
    gardenProgress.textContent = `${bloomed.size} of ${lilies.length} lilies in bloom`;
  }

  lilies.forEach(lily => {
    lily.addEventListener("click", () => {
      const index = Number(lily.dataset.lily);
      if (bloomed.has(index)) return;
      bloomed.add(index);
      lily.classList.add("bloomed");
      lily.setAttribute("aria-pressed", "true");
      updateGardenProgress();

      if (bloomed.size === lilies.length && !popupOpened) {
        popupOpened = true;
        window.setTimeout(() => gardenPopup.classList.remove("hidden"), 650);
      }
    });
  });

  function closeGardenPopup() { gardenPopup.classList.add("hidden"); }
  $("#closeGardenPopup").addEventListener("click", closeGardenPopup);
  gardenPopup.addEventListener("click", event => {
    if (event.target === gardenPopup) closeGardenPopup();
  });
  $("#resetGarden").addEventListener("click", () => {
    lilies.forEach(lily => {
      lily.classList.remove("bloomed");
      lily.setAttribute("aria-pressed", "false");
    });
    bloomed.clear();
    popupOpened = false;
    closeGardenPopup();
    updateGardenProgress();
  });
  updateGardenProgress();

  // Snoopy scrapbook scene tabs.
  const snoopyTabs = $$(".snoopy-tab");
  const snoopyScenes = $$(".snoopy-scene");
  snoopyTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const sceneId = tab.dataset.scene;
      snoopyTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      snoopyScenes.forEach(scene => {
        const isSelected = scene.id === sceneId;
        scene.hidden = !isSelected;
        if (!isSelected) {
          const player = $(".snoopy-video-player", scene);
          if (player) stopSnoopyVideo(player);
        }
      });
    });
  });

  // Personal artwork uploads: saved in this browser and blended into the pastel scene.
  // White backgrounds visually merge with the scene through mix-blend-mode in CSS.
  const ART_PREFIX = "monthsaryScrapbookArtwork:";
  const artworkInputs = $$('[data-artwork]');
  const artworkImages = [$("#homeArtworkPreview"), $("#woodstockArtworkPreview"), $("#fifiArtworkPreview")];

  // If you add these image files to the repository, everyone visiting the site can see them.
  function artworkFallback(image, visible) {
    const frame = image.closest("[data-artwork-frame]");
    const fallback = frame ? $(".artwork-fallback", frame) : null;
    if (fallback) fallback.hidden = !visible;
  }

  function revealPublicArtwork(image) {
    image.classList.remove("hidden");
    artworkFallback(image, false);
    if (image.id === "homeArtworkPreview") $("#coverBouquet")?.classList.add("hidden");
  }

  artworkImages.forEach(image => {
    if (!image) return;
    image.addEventListener("load", () => revealPublicArtwork(image));
    image.addEventListener("error", () => {
      image.classList.add("hidden");
      artworkFallback(image, true);
    });
    if (image.complete && image.naturalWidth > 0) revealPublicArtwork(image);
    else if (image.complete && image.naturalWidth === 0 && image.id !== "homeArtworkPreview") artworkFallback(image, true);
  });

  function applyArtwork(imageId, dataUrl) {
    const image = document.getElementById(imageId);
    if (!image || !dataUrl) return;
    image.src = dataUrl;
    image.classList.remove("hidden");
    artworkFallback(image, false);
    if (imageId === "homeArtworkPreview") {
      const bouquet = $("#coverBouquet");
      if (bouquet) bouquet.classList.add("hidden");
    }
  }

  const doghousePinArt = $("#doghousePinArt");
  if (doghousePinArt) {
    doghousePinArt.addEventListener("error", () => {
      doghousePinArt.classList.add("hidden");
      $(".doghouse-art-fallback")?.removeAttribute("hidden");
    });
    doghousePinArt.addEventListener("load", () => {
      $(".doghouse-art-fallback")?.setAttribute("hidden", "");
      doghousePinArt.classList.remove("hidden");
    });
    if (doghousePinArt.complete && doghousePinArt.naturalWidth === 0) {
      $(".doghouse-art-fallback")?.removeAttribute("hidden");
    }
  }

  async function compressImage(file) {
    if (typeof createImageBitmap !== "function") {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read image."));
        reader.readAsDataURL(file);
      });
    }

    const bitmap = await createImageBitmap(file);
    const maxDimension = 1100;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image canvas is unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL("image/webp", .82);
  }

  artworkInputs.forEach(input => {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        input.value = "";
        return;
      }
      const imageId = input.dataset.artwork;
      try {
        const dataUrl = await compressImage(file);
        applyArtwork(imageId, dataUrl);
        try {
          localStorage.setItem(ART_PREFIX + imageId, dataUrl);
        } catch (storageError) {
          console.warn("Artwork is shown for this visit but could not be saved in browser storage.", storageError);
        }
      } catch (error) {
        console.error("Artwork upload failed:", error);
        alert("That image could not be loaded. Please try another picture.");
      }
    });
  });

  artworkInputs.forEach(input => {
    const imageId = input.dataset.artwork;
    try {
      const saved = localStorage.getItem(ART_PREFIX + imageId);
      if (saved) applyArtwork(imageId, saved);
    } catch (error) {
      console.warn("Saved artwork could not be restored.", error);
    }
  });

  // Play curated Peanuts moments. A personal message appears only when the video ends.
  $$('[data-play-snoopy-video]').forEach(button => {
    const scene = button.closest(".snoopy-scene");
    const playerElement = scene?.querySelector(".snoopy-video-player");
    const frameContainer = playerElement?.querySelector(".snoopy-video-frame");
    const title = playerElement?.querySelector(".video-player-title");
    const credit = playerElement?.querySelector(".video-credit");
    const stopButton = playerElement?.querySelector(".stop-moment-button");
    const personalMessage = playerElement?.querySelector(".snoopy-personal-message");
    if (!scene || !playerElement || !frameContainer || !stopButton) return;

    const videoId = button.dataset.playSnoopyVideo;
    const videoTitle = button.dataset.videoTitle || "A little Snoopy moment";

    button.addEventListener("click", async () => {
      // Stop every other clip first so only one video can play at a time.
      $$(".snoopy-video-player").forEach(otherPlayer => {
        if (otherPlayer !== playerElement) stopSnoopyVideo(otherPlayer);
      });
      stopSnoopyVideo(playerElement, false);
      if (title) title.textContent = videoTitle;
      if (credit) credit.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
      if (personalMessage) personalMessage.hidden = true;
      playerElement.hidden = false;
      playerElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

      try {
        const YT = await loadYouTubeIframeApi();
        // Ignore a late API response if the visitor has already left this scene.
        if (playerElement.hidden || scene.hidden) return;
        const target = document.createElement("div");
        target.className = "snoopy-youtube-target";
        frameContainer.replaceChildren(target);
        const player = new YT.Player(target, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
          events: {
            onReady: event => event.target.playVideo(),
            onStateChange: event => {
              if (event.data === YT.PlayerState.ENDED && personalMessage && !scene.hidden && !playerElement.hidden) {
                personalMessage.hidden = false;
                personalMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            },
            onError: event => console.warn("This YouTube video could not be played here.", event.data)
          }
        });
        snoopyPlayers.set(playerElement, player);
      } catch (error) {
        console.error("Could not load the YouTube player.", error);
      }
    });

    stopButton.addEventListener("click", () => stopSnoopyVideo(playerElement));
  });

  // The doghouse opens in place; no character is animated out of a white-backed image.
  const doghouseButton = $("#doghouseButton");
  const doghouseHeart = $("#doghouseHeart");
  const openDoghouse = $("#openDoghouse");
  function toggleDoghouse() {
    const isOpen = doghouseButton.classList.toggle("open");
    doghouseHeart.classList.toggle("hidden", !isOpen);
    openDoghouse.textContent = isOpen ? "Close the Doghouse" : "Open the Doghouse";
    doghouseButton.setAttribute("aria-label", isOpen ? "Close Snoopy's doghouse" : "Open Snoopy's doghouse");
  }

  openDoghouse.addEventListener("click", toggleDoghouse);
  doghouseButton.addEventListener("click", toggleDoghouse);

  // Anniversary counter from August 14, 2025.
  const relationshipStart = new Date(2025, 7, 14);
  relationshipStart.setHours(0, 0, 0, 0);

  function addMonthsClamped(date, count) {
    const result = new Date(date.getFullYear(), date.getMonth() + count, 1);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(date.getDate(), lastDay));
    return result;
  }

  function updateCounter() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalDays = Math.max(0, Math.floor((today - relationshipStart) / 86400000));
    let wholeMonths = Math.max(0,
      (today.getFullYear() - relationshipStart.getFullYear()) * 12 +
      today.getMonth() - relationshipStart.getMonth()
    );
    let anniversary = addMonthsClamped(relationshipStart, wholeMonths);
    if (anniversary > today) {
      wholeMonths -= 1;
      anniversary = addMonthsClamped(relationshipStart, wholeMonths);
    }
    const years = Math.floor(wholeMonths / 12);
    const months = wholeMonths % 12;
    const days = Math.max(0, Math.floor((today - anniversary) / 86400000));

    $("#totalDays").textContent = String(totalDays);
    $("#years").textContent = String(years);
    $("#months").textContent = String(months);
    $("#days").textContent = String(days);
  }
  updateCounter();

  // Secret stays concealed until the gift is opened.
  const giftButton = $("#giftButton");
  const secretMessage = $("#secretMessage");
  giftButton.addEventListener("click", () => {
    giftButton.classList.add("opened");
    secretMessage.classList.remove("hidden");
    giftButton.setAttribute("aria-label", "Gift opened");
    giftButton.disabled = true;
  });

  // Keyboard dismissal for overlays.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closePhotoViewer();
      closeGardenPopup();
    }
    if (!photoViewer.classList.contains("hidden")) {
      if (event.key === "ArrowLeft") $("#previousPhoto").click();
      if (event.key === "ArrowRight") $("#nextPhoto").click();
    }
  });
})();
