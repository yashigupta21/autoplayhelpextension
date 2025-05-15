function autoClickButtons() {
  const buttons = document.querySelectorAll("button");
  for (let btn of buttons) {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes("skip intro") || text.includes("next episode")) {
      btn.click();
      console.log("✅ Clicked:", text);
    }
  }
}

setInterval(autoClickButtons, 1000);
