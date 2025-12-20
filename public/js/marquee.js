const marquee = document.querySelector(".promo-track");

function pauseMarquee() {
  marquee.style.animationPlayState = "paused";
}

function playMarquee() {
  marquee.style.animationPlayState = "running";
}
