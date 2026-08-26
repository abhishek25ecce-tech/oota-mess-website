const VIBE_API_URL = "https://script.google.com/macros/s/AKfycbwyR8hnP5n7TEY2H4JoD_CsWM-2t5e1Ob1LMtTYquUj2neEi4rLXDnIDAawgH8iGAk-pA/exec";
const MENU_API_URL = "https://script.google.com/macros/s/AKfycbyTF2bHlmsw8-cbEowsXuMADjr8UJC3CranpNLQtnxYTQrJ7eC_BkCcRjzEVf4ckMmt/exec";

function getFoodType(food) {
    const nonVegKeywords = [
        "CHICKEN",
        "EGG",
        "MUTTON",
        "FISH",
        "PRAWN",
        "MEAT"
    ];

    const foodUpper = food.toUpperCase();

    return nonVegKeywords.some(keyword => foodUpper.includes(keyword))
        ? "nonveg"
        : "veg";
}
function getFoodTypes(food) {
    const nonVegKeywords = [
        "CHICKEN",
        "EGG",
        "MUTTON",
        "FISH",
        "PRAWN",
        "MEAT"
    ];

    const foodUpper = food.toUpperCase();

    const hasNonVeg = nonVegKeywords.some(keyword =>
        foodUpper.includes(keyword)
    );

    // If food contains "/" and has a non-veg item,
    // show both VEG and NON-VEG tags
    if (foodUpper.includes("/") && hasNonVeg) {
        return ["veg", "nonveg"];
    }

    if (hasNonVeg) {
        return ["nonveg"];
    }

    return ["veg"];
}

function formatMenuItems(items) {
    if (!items || items.length === 0) {
        return "<p>No menu available.</p>";
    }

    return `
        <ul>
            ${items.map(item => {

                const types = getFoodTypes(item.food);

                const tags = types.map(type =>
                    type === "veg"
                        ? '<span class="food-tag veg">VEG</span>'
                        : '<span class="food-tag nonveg">NON-VEG</span>'
                ).join("");

                return `
                    <li>
                        <span>${item.food}</span>
                        <span class="food-tags">${tags}</span>
                    </li>
                `;

            }).join("")}
        </ul>
    `;
}
fetch(MENU_API_URL)
    .then(response => response.json())
    .then(menu => {

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        const todayMenu = menu[today];

        // =========================
        // TODAY'S MENU PAGE
        // =========================

        if (document.getElementById("menuMessage")) {

            if (!todayMenu) {

                document.getElementById("menuMessage").innerHTML =
                    "Today's menu has not been updated yet.";

                document.getElementById("breakfast").innerHTML = "";
                document.getElementById("lunch").innerHTML = "";
                document.getElementById("snacks").innerHTML = "";
                document.getElementById("dinner").innerHTML = "";

            } else {

                document.getElementById("menuMessage").innerHTML = "";

                document.getElementById("breakfast").innerHTML =
                    formatMenuItems(todayMenu.breakfast);

                document.getElementById("lunch").innerHTML =
                    formatMenuItems(todayMenu.lunch);

                // Your existing website uses the ID "snacks"
                // but it will now display Hi-Tea
                document.getElementById("snacks").innerHTML =
                    formatMenuItems(todayMenu.hiTea);

                document.getElementById("dinner").innerHTML =
                    formatMenuItems(todayMenu.dinner);
            }
        }

        // =========================
        // WEEKLY MENU PAGE
        // =========================

        if (document.getElementById("weeklyMenu")) {
            showWeeklyMenu(menu);
        }

    })
    .catch(error => {
        console.error("Menu loading error:", error);

        if (document.getElementById("menuMessage")) {
            document.getElementById("menuMessage").innerHTML =
                "Unable to load the menu. Please try again later.";
        }
    });


function showWeeklyMenu(menu) {

    const container = document.getElementById("weeklyMenu");

    if (!container) return;

    container.innerHTML = "";

    // Sort dates properly
    const dates = Object.keys(menu).sort();

    dates.forEach(date => {

        const day = menu[date];

        const formattedDate = new Date(
            date + "T12:00:00"
        ).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "short"
        });

        const card = document.createElement("div");
        card.className = "day-card";

        card.innerHTML = `
            <button class="day-header">
                <span>📅 ${formattedDate}</span>
                <span class="arrow">▼</span>
            </button>

            <div class="day-content">

                <h3>🍳 Breakfast</h3>
                ${formatMenuItems(day.breakfast)}

                <h3>🍛 Lunch</h3>
                ${formatMenuItems(day.lunch)}

                <h3>☕ Hi-Tea</h3>
                ${formatMenuItems(day.hiTea)}

                <h3>🌙 Dinner</h3>
                ${formatMenuItems(day.dinner)}

            </div>
        `;

        const header = card.querySelector(".day-header");
        const content = card.querySelector(".day-content");
        const arrow = card.querySelector(".arrow");

        header.addEventListener("click", () => {

            // Close other open days
            document.querySelectorAll(".day-content.open").forEach(openContent => {

                if (openContent !== content) {
                    openContent.classList.remove("open");

                    openContent.previousElementSibling
                        .querySelector(".arrow").textContent = "▼";
                }

            });

            content.classList.toggle("open");

            arrow.textContent =
                content.classList.contains("open")
                    ? "▲"
                    : "▼";
        });

        container.appendChild(card);
    });
}
// =========================
// TODAY'S DATE + MEAL STATUS
// =========================

function updateHomeStatus() {

    const now = new Date();

    // Show today's date
    const todayDate = document.getElementById("todayDate");

    if (todayDate) {
        todayDate.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }

    const homeStatus = document.getElementById("homeStatus");

    if (!homeStatus) return;

    const meals = [
        {
            name: "🍳 Breakfast",
            start: "07:30",
            end: "09:30"
        },
        {
            name: "🍛 Lunch",
            start: "12:00",
            end: "14:30"
        },
        {
            name: "☕ Hi-Tea",
            start: "16:30",
            end: "18:15"
        },
        {
            name: "🌙 Dinner",
            start: "19:30",
            end: "21:30"
        }
    ];

    function getMealTime(time) {
        const [hours, minutes] = time.split(":").map(Number);

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date;
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        }

        return `${minutes}m ${seconds}s`;
    }

    const currentMeal = meals.find(meal => {
        const start = getMealTime(meal.start);
        const end = getMealTime(meal.end);

        return now >= start && now < end;
    });

    if (currentMeal) {

        const end = getMealTime(currentMeal.end);

        homeStatus.innerHTML = `
            <span>🟢 ${currentMeal.name} IS OPEN</span>
            <strong>Closes in ${formatTime(end - now)}</strong>
        `;

    } else {

        let nextMeal = meals.find(meal => {
            return getMealTime(meal.start) > now;
        });

        if (!nextMeal) {
            nextMeal = meals[0];

            const tomorrowStart = getMealTime(nextMeal.start);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);

            homeStatus.innerHTML = `
                <span>🍽 NEXT MEAL: ${nextMeal.name}</span>
                <strong>Starts in ${formatTime(tomorrowStart - now)}</strong>
            `;

        } else {

            const start = getMealTime(nextMeal.start);

            homeStatus.innerHTML = `
                <span>🍽 NEXT MEAL: ${nextMeal.name}</span>
                <strong>Starts in ${formatTime(start - now)}</strong>
            `;
        }
    }
}

function highlightCurrentMeal() {

    const now = new Date();

    const meals = [
        { card: "breakfastCard", start: "07:30", end: "09:30" },
        { card: "lunchCard", start: "12:00", end: "14:30" },
        { card: "snacksCard", start: "16:30", end: "18:15" },
        { card: "dinnerCard", start: "19:30", end: "21:30" }
    ];

    // Remove highlight from all cards first
    meals.forEach(meal => {
        const card = document.getElementById(meal.card);
        if (card) card.classList.remove("active-meal");
    });

    // Highlight the currently open meal
    meals.forEach(meal => {
        const [startHour, startMinute] = meal.start.split(":").map(Number);
        const [endHour, endMinute] = meal.end.split(":").map(Number);

        const start = new Date();
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date();
end.setHours(endHour, endMinute, 0, 0);
        if (now >= start && now < end) {
            const card = document.getElementById(meal.card);
            if (card) card.classList.add("active-meal");
        }
    });
}

updateHomeStatus();
highlightCurrentMeal();

setInterval(() => {
    updateHomeStatus();
    highlightCurrentMeal();
}, 1000);
// =========================
// FOOD VIBE - LIVE REACTIONS
// =========================

const vibeButtons = document.querySelectorAll(".vibe-emojis button");
const dominantVibe = document.getElementById("dominantVibe");
const vibeMessage = document.getElementById("vibeMessage");

function updateVibeMessage(emoji) {

    if (!vibeMessage) return;

    const messages = {
        "😍": "Absolutely loved it!",
        "😋": "Looking good!",
        "🙂": "Pretty decent!",
        "😐": "Mixed vibes!",
        "😕": "Could be better!"
    };

    vibeMessage.textContent =
        messages[emoji] || "Share your food vibe!";
}
function getCurrentMeal() {
    const now = new Date();

    const meals = [
        { name: "Breakfast", start: "07:30", end: "09:30" },
        { name: "Lunch", start: "12:00", end: "14:30" },
        { name: "Snacks", start: "16:30", end: "18:15" },
        { name: "Dinner", start: "19:30", end: "21:30" }
    ];

    for (const meal of meals) {

        const [startHour, startMinute] = meal.start.split(":").map(Number);
        const [endHour, endMinute] = meal.end.split(":").map(Number);

        const start = new Date();
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date();
        end.setHours(endHour, endMinute, 0, 0);

        if (now >= start && now < end) {
            return meal.name;
        }
    }

    return null;
}


// =========================
// EMOJI CLICK + ONE VOTE PER MEAL
// =========================

vibeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const currentMeal = getCurrentMeal();

        if (!currentMeal) {
            alert("Food reactions are available during meal time.");
            return;
        }

        const emoji = button.dataset.vibe;

        // Today's date
        const today = new Date().toLocaleDateString("en-CA");

        // Unique key for this device, date and meal
        const voteKey = `foodVibe_${today}_${currentMeal}`;

        // Check if this browser has already voted
        if (localStorage.getItem(voteKey)) {
            alert("You have already shared your food vibe for this meal 😊");
            return;
        }

        button.disabled = true;

        fetch(VIBE_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                date: today,
                meal: currentMeal,
                emoji: emoji
            })
        })
        .then(() => {

            // Save that this device has voted
            localStorage.setItem(voteKey, emoji);

            vibeButtons.forEach(btn => {
                btn.classList.remove("selected-vibe");
            });

            button.classList.add("selected-vibe");

            // Show selected emoji immediately
            if (dominantVibe) {
                dominantVibe.textContent = emoji;
            }

            // Change message according to selected emoji
            updateVibeMessage(emoji);

            // Reload actual dominant emoji
            setTimeout(loadFoodVibe, 1000);
        })
        .catch(error => {
            console.error("Food vibe error:", error);
            alert("Could not save your reaction. Please try again.");
        })
        .finally(() => {
            button.disabled = false;
        });

    }); // closes button.addEventListener

}); // closes vibeButtons.forEach


// =========================
// LOAD DOMINANT FOOD VIBE
// =========================

function loadFoodVibe() {

    const currentMeal = getCurrentMeal();

    if (!currentMeal || !dominantVibe) return;

    const today = new Date().toLocaleDateString("en-CA");

    fetch(
        `${VIBE_API_URL}?date=${encodeURIComponent(today)}&meal=${encodeURIComponent(currentMeal)}`
    )
    .then(response => response.json())
    .then(reactions => {

        let dominantEmoji = null;
        let highestCount = 0;

        Object.entries(reactions).forEach(([emoji, count]) => {

            if (count > highestCount) {
                dominantEmoji = emoji;
                highestCount = count;
            }

        });

        if (dominantEmoji) {
            dominantVibe.textContent = dominantEmoji;
            updateVibeMessage(dominantEmoji);
        }

    })
    .catch(error => {
        console.error("Could not load food vibe:", error);
    });
}


// =========================
// START FOOD VIBE SYSTEM
// =========================

loadFoodVibe();

// Refresh every 10 seconds
setInterval(loadFoodVibe, 10000);
// =========================
// LIVE CIRCULAR MEAL TIMER
// =========================

const mealProgressContainer = document.getElementById("mealProgressContainer");
const mealProgressBar = document.getElementById("mealProgressBar");
const mealProgressPercent = document.getElementById("mealProgressPercent");
const mealProgressLabel = document.getElementById("mealProgressLabel");
const timerEmoji = document.getElementById("timerEmoji");
const timerReaction = document.getElementById("timerReaction");
const timerMessageTitle = document.getElementById("timerMessageTitle");

function formatMealCountdown(milliseconds) {

    if (milliseconds <= 0) {
        return "00:00";
    }

    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}


function updateCircularMealTimer() {

    // Safety check
    if (!mealProgressContainer) return;

    const now = new Date();

    const meals = [
        {
            name: "Breakfast",
            start: "07:30",
            end: "09:30",
            emoji: "🍳"
        },
        {
            name: "Lunch",
            start: "12:00",
            end: "14:30",
            emoji: "🍛"
        },
        {
            name: "Snacks",
            start: "16:30",
            end: "18:15",
            emoji: "☕"
        },
        {
            name: "Dinner",
            start: "19:30",
            end: "21:30",
            emoji: "🌙"
        }
    ];

    let activeMeal = null;
    let startTime;
    let endTime;

    meals.forEach(meal => {

        const [startHour, startMinute] =
            meal.start.split(":").map(Number);

        const [endHour, endMinute] =
            meal.end.split(":").map(Number);

        const start = new Date();
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date();
        end.setHours(endHour, endMinute, 0, 0);

        if (now >= start && now < end) {
            activeMeal = meal;
            startTime = start;
            endTime = end;
        }

    });


    // No meal is currently open
    if (!activeMeal) {

        mealProgressContainer.style.display = "none";

        return;
    }


    // Show timer
    mealProgressContainer.style.display = "flex";


    // Calculate timing
    const totalTime = endTime - startTime;
    const remainingTime = endTime - now;

    const remainingPercent = remainingTime / totalTime;


    // =========================
    // UPDATE CIRCULAR RING
    // =========================

    const circumference = 326.73;

    const offset =
        circumference * (1 - remainingPercent);

    if (mealProgressBar) {
        mealProgressBar.style.strokeDasharray = circumference;
        mealProgressBar.style.strokeDashoffset = offset;
    }


    // =========================
    // UPDATE COUNTDOWN
    // =========================

    if (mealProgressPercent) {
        mealProgressPercent.textContent =
            formatMealCountdown(remainingTime);
    }


    // =========================
    // UPDATE MEAL EMOJI
    // =========================

    if (timerEmoji) {
        timerEmoji.textContent = activeMeal.emoji;
    }


    // =========================
    // DYNAMIC REACTIONS
    // =========================

    if (remainingPercent > 0.70) {

        timerReaction.textContent = "😌";
        timerMessageTitle.textContent = "Take your time!";
        mealProgressLabel.textContent = "Plenty of time left";

    }

    else if (remainingPercent > 0.40) {

        timerReaction.textContent = "🙂";
        timerMessageTitle.textContent = "No rush!";
        mealProgressLabel.textContent = "You still have time";

    }

    else if (remainingPercent > 0.20) {

        timerReaction.textContent = "👀";
        timerMessageTitle.textContent = "Don't forget!";
        mealProgressLabel.textContent = "Meal time is moving";

    }

    else if (remainingPercent > 0.05) {

        timerReaction.textContent = "🏃";
        timerMessageTitle.textContent = "Hurry up!";
        mealProgressLabel.textContent = "Closing soon";

    }

    else {

        timerReaction.textContent = "🚨";
        timerMessageTitle.textContent = "Last chance!";
        mealProgressLabel.textContent = "Run for your food!";
    }

}


// Start timer immediately
updateCircularMealTimer();


// Update every second
setInterval(updateCircularMealTimer, 1000);
// =========================
// MEAL NOTIFICATIONS
// =========================

const notificationToggle =
    document.getElementById("notificationToggle");

const notificationStatus =
    document.getElementById("notificationStatus");

function updateNotificationUI() {

    if (!notificationToggle || !notificationStatus) return;

    if (!("Notification" in window)) {

        notificationToggle.textContent = "Not supported";
        notificationStatus.textContent =
            "Notifications are not supported in this browser";

        notificationToggle.disabled = true;
        return;
    }

    if (Notification.permission === "granted") {

        notificationToggle.textContent = "Enabled 🔔";
        notificationStatus.textContent =
            "You'll be notified when meals start";

        notificationToggle.classList.add("notifications-enabled");

    } else {

        notificationToggle.textContent = "Enable";
        notificationStatus.textContent =
            "Get notified when a meal starts";

        notificationToggle.classList.remove("notifications-enabled");
    }
}


if (notificationToggle) {

    notificationToggle.addEventListener("click", async () => {

        if (!("Notification" in window)) {
            alert("Your browser does not support notifications.");
            return;
        }

        if (Notification.permission === "default") {

            const permission =
                await Notification.requestPermission();

            if (permission === "granted") {

                localStorage.setItem(
                    "mealNotificationsEnabled",
                    "true"
                );
                new Notification("🔔 Oota Test", {
                body: "Notifications are working!"
                });
                
                alert("Meal notifications enabled! 🔔");

            } else {

                alert("Notification permission was not allowed.");
            }

        } else if (Notification.permission === "granted") {

            localStorage.setItem(
                "mealNotificationsEnabled",
                "true"
            );

            alert("Meal notifications are enabled 🔔");

        } else {

            alert(
                "Notifications are blocked. Please enable them in your browser settings."
            );
        }

        updateNotificationUI();

    });

}
// =========================
// MEAL NOTIFICATION TIMES
// =========================

const mealNotificationTimes = [
    {
        name: "Breakfast",
        time: "07:30",
        emoji: "🍳"
    },
    {
        name: "Lunch",
        time: "12:00",
        emoji: "🍛"
    },
    {
        name: "Snacks",
        time: "16:30",
        emoji: "☕"
    },
    {
        name: "Dinner",
        time: "19:30",
        emoji: "🌙"
    }
];


function checkMealNotifications() {

    // Notifications must be enabled
    if (
        localStorage.getItem("mealNotificationsEnabled") !== "true"
    ) {
        return;
    }

    // Browser permission must be granted
    if (Notification.permission !== "granted") {
        return;
    }

    const now = new Date();

    const currentHours =
        String(now.getHours()).padStart(2, "0");

    const currentMinutes =
        String(now.getMinutes()).padStart(2, "0");

    const currentTime =
        `${currentHours}:${currentMinutes}`;

    const today =
        now.toLocaleDateString("en-CA");

    mealNotificationTimes.forEach(meal => {

        if (currentTime === meal.time) {

            // Prevent duplicate notification
            const notificationKey =
                `mealNotification_${today}_${meal.name}`;

            if (localStorage.getItem(notificationKey)) {
                return;
            }

            new Notification(
                `${meal.emoji} ${meal.name} is now being served!`,
                {
                    body: `Your ${meal.name.toLowerCase()} is ready. Enjoy your meal! 🍽️`
                }
            );

            // Mark as sent
            localStorage.setItem(
                notificationKey,
                "sent"
            );
        }

    });

}


// Check every 10 seconds
setInterval(checkMealNotifications, 10000);


// Set correct button state when page loads
updateNotificationUI();
// =========================
// COLLAPSIBLE MEAL CARDS
// =========================

const mealCards = document.querySelectorAll(".meal-card");

mealCards.forEach(card => {

    const header = card.querySelector(".meal-card-header");

    header.addEventListener("click", () => {

        card.classList.toggle("open");

    });

});
