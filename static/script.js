function setActive(button) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.style.opacity = 0.5);
    button.style.opacity = 1;
}



// Makes it decide smarter
function generateInsight(data) {
    if (!data || data.length < 2) return "Not enough data";

    const last = data[data.length - 1];
    const prev = data[data.length - 2];

    if (last.total < prev.total && last.rank < prev.rank) {
        return "Test was harder than usual";
    }

    if (last.total > prev.total && last.rank > prev.rank) {
        return "Competition was stronger";
    }

    if (last.total > prev.total && last.rank < prev.rank) {
        return "Great improvement!";
    }

    return "Performance stable";
}