// 1. Put your connection details here (Replace with your actual keys!)
const SUPABASE_URL = "https://jrltmqnkqarcvwoqsvxx.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_n6cdCli1q5LEmdyJ4GleuQ_2a2APbA6";

// 2. Grab the HTML elements
const tokenInput = document.getElementById("tokenInput");
const unlockBtn = document.getElementById("unlockBtn");
const messageDisplay = document.getElementById("messageDisplay");

// 3. Listen for the button click
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
        // Kinakausap natin ang database mo gamit ang default URL network ng Supabase
        const fetchUrl = `${SUPABASE_URL}/rest/v1/tokens?token_code=eq.${enteredToken}`;
        
        const response = await fetch(fetchUrl, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const data = await response.json();

        // Kung walang nahanap na match na row sa database
        if (!response.ok || data.length === 0) {
            messageDisplay.textContent = "Invalid Token Code. Please double-check.";
            unlockBtn.disabled = false;
            unlockBtn.textContent = "Unlock Template";
            return;
        }

        const record = data[0]; // Kunin ang unang nakitang row match

        // Tingnan kung gamit na ang token
        if (record.is_used === true) {
            messageDisplay.textContent = "This token has already been claimed.";
            unlockBtn.disabled = false;
            unlockBtn.textContent = "Unlock Template";
            return;
        }

        // --- STEP B: BURN (Native HTTP PATCH) ---
        // Sunugin agad ang token para hindi na maipasa sa iba
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
        
        // I-benta sila papunta sa Canva link na nakasulat sa row nila
        window.location.href = record.canva_url;

    } catch (err) {
        console.error(err);

        messageDisplay.textContent = "An unexpected network error occurred.";
        unlockBtn.disabled = false;
        unlockBtn.textContent = "Unlock Template";
    }
});
