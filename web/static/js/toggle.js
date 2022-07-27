toggle = document.getElementById("toggle");
body = document.getElementById("body");
header = document.getElementById("header");

function toggles() {
  if (toggle.checked == true) {
    body.style.backgroundColor = "black";
    header.style.color = "white";
  } else {
    body.style.backgroundColor = "white";
    header.style.color = "black";
  }
}
