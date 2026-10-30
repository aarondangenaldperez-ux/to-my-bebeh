function showLove() {
  const surprise = document.getElementById("surprise");

  surprise.innerHTML =
    "I love you so much, Bebeee! ♡ 🌷🐶<br>" +
    "You make my world a little more beautiful every day.";

  createHearts();
}

function createHearts() {
  const hearts = ["💕", "💗", "💖", "🌸", "🌷"];

  for (let i = 0; i < 12; i++) {
    const heart = document.createElement("span");

    heart.textContent =
      hearts[Math.floor(Math.random() * hearts.length)];

    heart.style.position = "fixed";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.top = "-30px";
    heart.style.fontSize = "24px";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "9999";
    heart.style.transition = "transform 3s linear, opacity 3s";

    document.body.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.transform = "translateY(110vh) rotate(360deg)";
      heart.style.opacity = "0";
    });

    setTimeout(() => heart.remove(), 3000);
  }
}
