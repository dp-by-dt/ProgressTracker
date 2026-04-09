function setActive(button) {
    document.querySelectorAll("button").forEach(btn => btn.style.opacity = 0.5);
    button.style.opacity = 1;
}