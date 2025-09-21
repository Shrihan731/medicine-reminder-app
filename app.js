// Request notification permission
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// Load stored medicines
let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
const form = document.getElementById("medicine-form");
const list = document.getElementById("medicine-list");

// Display medicines
function renderMedicines() {
  list.innerHTML = "";
  const today = new Date();

  medicines.forEach((med, index) => {
    // Calculate days passed
    const start = new Date(med.startDate);
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const daysLeft = med.days - daysPassed;

    // Only show if there are days left
    if (daysLeft > 0) {
      let li = document.createElement("li");
      li.textContent = `${med.time} → ${med.name} (${med.quantity}) - ${daysLeft} day(s) left`;
      list.appendChild(li);
    }
  });
}


renderMedicines();

// Add new medicine
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const quantity = document.getElementById("quantity").value;
  const time = document.getElementById("time").value;
  const days = parseInt(document.getElementById("days").value); // NEW
  const startDate = new Date().toDateString();                  // NEW

  let med = { name, quantity, time, days, startDate };         // UPDATED
  medicines.push(med);
  localStorage.setItem("medicines", JSON.stringify(medicines));

  scheduleNotification(med);
  renderMedicines();
  form.reset();
});


// Schedule notifications with duration check
function scheduleNotification(med) {
  const now = new Date();

  // Calculate days passed
  const start = new Date(med.startDate);
  const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  if (daysPassed >= med.days) {
    // Stop scheduling if duration exceeded
    return;
  }

  const [hours, minutes] = med.time.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target < now) target.setDate(target.getDate() + 1);

  const timeout = target.getTime() - now.getTime();

  setTimeout(() => {
    new Notification("💊 Medicine Reminder", {
      body: `Take ${med.quantity} of ${med.name}`,
      icon: "icon.png"
    });
    // Reschedule for next day
    scheduleNotification(med);
  }, timeout);
}

// Reschedule all medicines on app load
medicines.forEach(scheduleNotification);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
