function formatMenu(menu) {
    return "<ul><li>" +
        menu
            .split(/\r?\n/)
            .filter(item => item.trim() !== "")
            .join("</li><li>") +
        "</li></ul>";
}
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZBH-lXekEeA3Ybv6KzEhtaWcn0r3Lbrr16iiABZO5w1MGi7vzr8_-qSoyCXDie5aYM5Ta7dVEbrn_/pub?output=csv";

Papa.parse(CSV_URL, {
    download: true,
    header: true,
    complete: function(results) {
    const menu = results.data;

    const today = new Date().toISOString().split("T")[0];

 const todayMenu = menu.find(item => item.Date === today);

// Today's Menu page
if (document.getElementById("todayMessage")) {

    if (!todayMenu || (!todayMenu.Breakfast && !todayMenu.Lunch && !todayMenu.Snacks && !todayMenu.Dinner)) {

        document.getElementById("todayMessage").innerHTML =
            "Today's menu has not been updated yet.";

        document.getElementById("breakfast").innerHTML = "";
        document.getElementById("lunch").innerHTML = "";
        document.getElementById("snacks").innerHTML = "";
        document.getElementById("dinner").innerHTML = "";

        return;
    }

    document.getElementById("breakfast").innerHTML =
        formatMenu(todayMenu.Breakfast);

    document.getElementById("lunch").innerHTML =
        formatMenu(todayMenu.Lunch);

    document.getElementById("snacks").innerHTML =
        formatMenu(todayMenu.Snacks);

    document.getElementById("dinner").innerHTML =
        formatMenu(todayMenu.Dinner);
}


// Weekly Menu page
if (document.getElementById("weeklyMenu")) {
    showWeeklyMenu(menu);
}
    }
});
if (document.getElementById("weeklyMenu")) {

    console.log("Weekly page detected");

}
function showWeeklyMenu(menu) {

    const container = document.getElementById("weeklyMenu");

    if (!container) return;

    container.innerHTML = "";

    menu.forEach((day, index) => {

        const card = document.createElement("div");
        card.className = "day-card";

        card.innerHTML = `
            <button class="day-header">
                <span>📅 ${day.Date}</span>
                <span class="arrow">▼</span>
            </button>

            <div class="day-content">

                <h3>🍳 Breakfast</h3>
                ${formatMenu(day.Breakfast)}

                <h3>🍛 Lunch</h3>
                ${formatMenu(day.Lunch)}

                <h3>🍪 Snacks</h3>
                ${formatMenu(day.Snacks)}

                <h3>🌙 Dinner</h3>
                ${formatMenu(day.Dinner)}

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

            arrow.textContent = content.classList.contains("open")
                ? "▲"
                : "▼";
        });

        container.appendChild(card);
    });
}