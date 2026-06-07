const subTeams = {
    "iGV": ["iGV B2B", "iGV CXP", "iGV M & IR", "Other"],
    "iGT": ["iGT B2B & CXP", "iGT M & IR", "Other"],
    "oGV": ["oGV B2C", "oGV PS", "Other"],
    "oGT": ["oGTe", "oGTa", "Customer Relations (CR)", "IR & M", "Other"],
    "EB": ["Executive Board"],
    "Alumni": ["Alumni"]
};

// Advanced Dark Mode Tinting based on selected color
const themeColors = {
    "Red": { main: "#e74c3c", darkBg: "#1a0505" },
    "Blue": { main: "#3498db", darkBg: "#050a1a" },
    "Green": { main: "#2ecc71", darkBg: "#051a0a" },
    "Yellow": { main: "#f1c40f", darkBg: "#1a1705" },
    "Orange": { main: "#e67e22", darkBg: "#1a0d05" },
    "Cyan": { main: "#00bcd4", darkBg: "#05171a" },
    "White": { main: "#ffffff", darkBg: "#111111" },
    "Black": { main: "#7f8c8d", darkBg: "#000000" }
};

const urlParams = new URLSearchParams(window.location.search);
const entity = urlParams.get('entity') || "Unknown";

const entityTitle = document.getElementById('entity-title');
const subTeamSelect = document.getElementById('sub-team');
const subTeamGroup = document.getElementById('subteam-group');
const delegateForm = document.getElementById('delegate-form');
const successMessage = document.getElementById('success-message');
const submitBtn = document.getElementById('submit-btn');

const themeBox = document.getElementById('dynamic-theme-box');
const defaultBox = document.getElementById('default-theme-box');
const teamNameDisplay = document.getElementById('team-name-display');
const teamMascotImg = document.getElementById('team-mascot-img');

if (entity === "EB" || entity === "Alumni") {
    entityTitle.innerText = `SPORTS LCM ${entity.toUpperCase()}`;
} else {
    entityTitle.innerText = `${entity} DELEGATE`;
}

if (subTeams[entity]) {
    if (entity === "EB" || entity === "Alumni") {
        subTeamGroup.classList.add('hidden');
        const option = document.createElement("option");
        option.value = subTeams[entity][0];
        option.selected = true;
        subTeamSelect.appendChild(option);
    } else {
        subTeams[entity].forEach(team => {
            const option = document.createElement("option");
            option.value = team;
            option.innerText = team;
            subTeamSelect.appendChild(option);
        });
    }
}

async function applyTeamTheme() {
    // 1. Override for EB Griffins
    if (entity === "EB") {
        themeBox.classList.remove('hidden');
        defaultBox.classList.add('hidden');
        
        teamNameDisplay.innerText = "EB GRIFFINS";
        // Make sure you drop 'griffin.png' into your assets folder!
        teamMascotImg.src = `assets/griffin.png`; 

        const theme = themeColors["Yellow"]; // Using the Gold/Yellow theme
        document.documentElement.style.setProperty('--accent-color', theme.main);
        document.documentElement.style.setProperty('--primary-color', theme.main);
        document.documentElement.style.setProperty('--bg-dark', theme.darkBg);
        return; // Stop here so it doesn't check the database
    }

    // 2. Standard Database Lookup for FOs
    if (["iGV", "iGT", "oGV", "oGT"].includes(entity)) {
        try {
            const doc = await db.collection("teams").doc(entity).get();
            
            if (doc.exists) {
                const teamData = doc.data();
                
                themeBox.classList.remove('hidden');
                defaultBox.classList.add('hidden');
                
                teamNameDisplay.innerText = teamData.teamName;
                teamMascotImg.src = `assets/${teamData.mascot.toLowerCase()}.png`;

                const theme = themeColors[teamData.color] || themeColors["White"];
                
                document.documentElement.style.setProperty('--accent-color', theme.main);
                document.documentElement.style.setProperty('--primary-color', theme.main);
                document.documentElement.style.setProperty('--bg-dark', theme.darkBg);
            }
        } catch (error) {
            console.error("Error fetching team data:", error);
        }
    }
}
delegateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.innerText = "PROCESSING...";
    submitBtn.disabled = true;

    const delegateData = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        faction: entity,
        subTeam: subTeamSelect.value,
        role: document.getElementById('role').value,
        diet: document.getElementById('diet').value,
        confirmed: document.getElementById('confirmation').checked,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("delegates").add(delegateData);
        delegateForm.reset();
        submitBtn.classList.add("hidden");
        successMessage.classList.remove("hidden");
    } catch (error) {
        console.error("Error registering delegate: ", error);
        submitBtn.innerText = "ERROR. TRY AGAIN.";
        submitBtn.disabled = false;
    }
});
