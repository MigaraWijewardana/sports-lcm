const authData = {
    "oGTeacher_talent": { fo: "oGT", lcvps: ["LCVP oGTa - Vihangi Ranaweera", "LCVP oGTe - Jayashni Rodrigo"] },
    "Catch_em_all": { fo: "iGT", lcvps: ["LCVP iGT B2B & CXP - Jemima Mohamed", "LCVP iGT M & IR - Tharuka Gunarathne"] },
    "The_GenVics": { fo: "oGV", lcvps: ["LCVP oGV B2C - Devmi Galagedara", "LCVP oGV PS - Sineli Thilakarathne"] },
    "StarTeamIGV": { fo: "iGV", lcvps: ["LCVP iGV B2B - Nayana Fernando", "LCVP iGV CXP - Dileepa Gayantha", "LCVP iGV M & IR - Navapriyah Krishnan"] }
};

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

let currentFO = "";

// DOM Elements
const loginContainer = document.getElementById("login-container");
const regContainer = document.getElementById("registration-container");
const loginBtn = document.getElementById("login-btn");
const passInput = document.getElementById("fo-password");
const loginError = document.getElementById("login-error");
const lcvpSelect = document.getElementById("lcvp-name");
const welcomeText = document.getElementById("welcome-text");
const teamForm = document.getElementById("team-form");
const teamNameInput = document.getElementById("team-name");
const mascotSelect = document.getElementById("team-mascot");
const successMessage = document.getElementById("success-message");

// Live Visualizer Elements
const defaultBranding = document.getElementById("default-branding");
const dynamicThemeBox = document.getElementById("dynamic-theme-box");
const liveFoTitle = document.getElementById("live-fo-title");
const mascotImage = document.getElementById("team-mascot-img");
const teamNameDisplay = document.getElementById("team-name-display");

// Swatch Elements
const colorSwatches = document.querySelectorAll('.color-swatch');
const teamColorInput = document.getElementById('team-color');
const colorError = document.getElementById('color-error');

// --- 1. Login Logic ---
loginBtn.addEventListener("click", () => {
    const enteredPass = passInput.value.trim();
    if (authData[enteredPass]) {
        currentFO = authData[enteredPass].fo;
        const lcvpList = authData[enteredPass].lcvps;
        
        loginContainer.classList.add("hidden");
        regContainer.classList.remove("hidden");
        welcomeText.innerHTML = `WELCOME, <span class="text-glow">${currentFO}</span>`;
        liveFoTitle.innerText = `${currentFO} COMMANDER ACTIVE`;
        
        lcvpList.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.innerText = name;
            lcvpSelect.appendChild(option);
        });

        listenToTakenOptions();
    } else {
        loginError.classList.remove("hidden");
    }
});

// --- 2. Live UI Updates (Team Name) ---
teamNameInput.addEventListener("input", (e) => {
    defaultBranding.classList.add("hidden");
    dynamicThemeBox.classList.remove("hidden");
    teamNameDisplay.innerText = e.target.value.toUpperCase() || "TEAM NAME";
});

// --- 3. Live UI Updates (Colors) ---
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        if (swatch.classList.contains('taken')) return;
        
        colorSwatches.forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        
        const selectedColor = swatch.getAttribute('data-color');
        teamColorInput.value = selectedColor;
        colorError.classList.add('hidden'); 
        
        // Trigger Live Chameleon CSS Changes
        const theme = themeColors[selectedColor];
        document.documentElement.style.setProperty('--accent-color', theme.main);
        document.documentElement.style.setProperty('--primary-color', theme.main);
        document.documentElement.style.setProperty('--bg-dark', theme.darkBg);
        
        defaultBranding.classList.add("hidden");
        dynamicThemeBox.classList.remove("hidden");
    });
});

// --- 4. Live UI Updates (Mascot) ---
mascotSelect.addEventListener('change', (e) => {
    const selectedMascot = e.target.value;
    if (selectedMascot) {
        defaultBranding.classList.add("hidden");
        dynamicThemeBox.classList.remove("hidden");
        mascotImage.src = `assets/${selectedMascot.toLowerCase()}.png`;
        mascotImage.classList.remove("hidden");
    }
});

        // --- 5. Firebase Real-Time Lockout Logic ---
function listenToTakenOptions() {
    db.collection("teams").onSnapshot((snapshot) => {
        const takenColors = [];
        const takenMascots = [];
        let isAlreadyRegistered = false;

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Check if the current FO has already registered
            if (doc.id === currentFO) {
                isAlreadyRegistered = true;
            } else {
                takenColors.push(data.color);
                takenMascots.push(data.mascot);
            }
        });

        // Trigger Lockout if they already registered
        if (isAlreadyRegistered) {
            teamForm.classList.add("hidden");
            document.getElementById("welcome-text").innerHTML = `<span style="color: #ff4757;">ALREADY REGISTERED</span>`;
            document.getElementById("live-fo-title").innerText = `${currentFO} IDENTITY LOCKED`;
            
            // Create the lockout message if it doesn't exist
            if (!document.getElementById("already-reg-msg")) {
                const msg = document.createElement("p");
                msg.id = "already-reg-msg";
                msg.className = "error-text";
                msg.style.marginTop = "20px";
                msg.style.fontSize = "16px";
                msg.innerHTML = "Your team's identity has already been locked in.<br>You cannot register twice.";
                teamForm.parentElement.appendChild(msg);
            }
            return; // Halt further form logic
        }

        // Standard lockout for colors/mascots taken by OTHER teams
        colorSwatches.forEach(swatch => {
            const swatchColor = swatch.getAttribute('data-color');
            if (takenColors.includes(swatchColor)) {
                swatch.classList.add('taken');
                swatch.classList.remove('selected');
                if (teamColorInput.value === swatchColor) teamColorInput.value = ""; 
            }
        });

        Array.from(mascotSelect.options).forEach(option => {
            if (option.value && takenMascots.includes(option.value)) {
                option.disabled = true;
                option.innerText = `${option.value} (TAKEN)`;
            }
        });
    });
}
    }
});
