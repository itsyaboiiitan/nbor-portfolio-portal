const SUPABASE_URL = "https://jrltmqnkqarcvwoqsvxx.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_n6cdCli1q5LEmdyJ4GleuQ_2a2APbA6";

const tokenInput = document.getElementById("tokenInput");
const unlockBtn = document.getElementById("unlockBtn");
const messageDisplay = document.getElementById("messageDisplay");

unlockBtn.addEventListener("click", async () => {
    const enteredToken = tokenInput.value.trim();
    messageDisplay.textContent = ""; 
    messageDisplay.style.color = "red"; 

    if (!enteredToken) {
        messageDisplay.textContent = "Please enter a token code.";
        return;
    }

    try {
        unlockBtn.disabled = true;
        unlockBtn.textContent = "Verifying...";

        // --- STEP A: CHECK & VERIFY (Native HTTP GET) ---
        const fetchUrl = `${SUPABASE_URL}/rest/v1/tokens?token_code=eq.${enteredToken}`;
        
        const response = await fetch(fetchUrl, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const data = await response.json();

        if (!response.ok || data.length === 0) {
            messageDisplay.textContent = "Invalid Token Code. Please double-check.";
            unlockBtn.disabled = false;
            unlockBtn.textContent = "Unlock Template";
            return;
        }

        const record = data[0];

        if (record.is_used === true) {
            messageDisplay.textContent = "This token has already been claimed.";
            unlockBtn.disabled = false;
            unlockBtn.textContent = "Unlock Template";
            return;
        }

        // --- STEP B: BURN (Native HTTP PATCH) ---
        const updateUrl = `${SUPABASE_URL}/rest/v1/tokens?id=eq.${record.id}`;
        
        const updateResponse = await fetch(updateUrl, {
            method: "PATCH",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ is_used: true })
        });

        if (!updateResponse.ok) {
            messageDisplay.textContent = "Verification error. Please try again.";
            unlockBtn.disabled = false;
            unlockBtn.textContent = "Unlock Template";
            return;
        }

        // --- STEP C: GRAB & GO ---
        messageDisplay.style.color = "green";
        messageDisplay.textContent = "Success! Redirecting to Canva...";
        
        window.location.href = record.canva_url;

    } catch (err) {
        console.error(err);

        messageDisplay.textContent = "An unexpected network error occurred.";
        unlockBtn.disabled = false;
        unlockBtn.textContent = "Unlock Template";
    }
});
