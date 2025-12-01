let tricksCursor = document.querySelector(".cursor");
window.addEventListener("mousemove", cursor);

function cursor(e) {
  tricksCursor.style.top = e.pageY + "px";
  tricksCursor.style.left = e.pageX + "px";
}

$(document).on("mouseenter", "a:not(.no-cursor)", function () {
  window.removeEventListener("mousemove", cursor);

  var tricksWidth = $(this).outerWidth() / 2;
  var tricksHeight = $(this).outerHeight() / 2;
  var tricksTop = $(this).offset().top;
  var tricksLeft = $(this).offset().left;

  tricksCursor.style.top = tricksTop + tricksHeight + "px";
  tricksCursor.style.left = tricksLeft + tricksWidth + "px";
});

$(document).on("mouseleave", "a:not(.no-cursor)", function () {
  window.addEventListener("mousemove", cursor);
});

// Add class on hover
$(document).on("mouseenter", "a:not(.no-cursor)", function () {
  $(".cursor").addClass("cursor-hover");
});

$(document).on("mouseleave", "a:not(.no-cursor)", function () {
  $(".cursor").removeClass("cursor-hover");
});

// Add class on mouse down
$("body").mousedown(function () {
  $(".cursor").addClass("cursor-pressed");
});

$("body").mouseup(function () {
  $(".cursor").removeClass("cursor-pressed");
});
