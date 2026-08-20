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
            start: "07:00",
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
            start: "19:00",
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
        { card: "breakfastCard", start: "07:00", end: "09:30" },
        { card: "lunchCard", start: "12:00", end: "14:30" },
        { card: "snacksCard", start: "16:30", end: "18:15" },
        { card: "dinnerCard", start: "19:00", end: "21:30" }
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