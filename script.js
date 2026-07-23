document.addEventListener("DOMContentLoaded", () => {
    
    // UI Elements Selector
    const diseaseInput = document.getElementById("diseaseInput");
    const generateBtn = document.getElementById("generateBtn");
    const newRxBtn = document.getElementById("newRxBtn");
    const loader = document.getElementById("loader");
    const rxOutput = document.getElementById("rxOutput");
    const rxDate = document.getElementById("rxDate");
    const rxDisease = document.getElementById("rxDisease");
    const historyList = document.getElementById("historyList");
    
    // Modal & API Key Elements
    const apiKeyBtn = document.getElementById("apiKeyBtn");
    const apiModal = document.getElementById("apiModal");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveKeyBtn = document.getElementById("saveKeyBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");

    // Retrieve API Key from LocalStorage safely
    let GROQ_API_KEY = localStorage.getItem("DR_SAMI_GROQ_KEY") || "";

    // API Modal Handlers
    apiKeyBtn.addEventListener("click", () => {
        apiKeyInput.value = GROQ_API_KEY;
        apiModal.style.display = "flex";
    });

    closeModalBtn.addEventListener("click", () => {
        apiModal.style.display = "none";
    });

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            GROQ_API_KEY = key;
            localStorage.setItem("DR_SAMI_GROQ_KEY", GROQ_API_KEY);
            alert("✅ API Key saved successfully!");
            apiModal.style.display = "none";
        } else {
            alert("Please enter a valid Groq API Key!");
        }
    });

    // Auto Key Prompt Check
    function checkApiKey() {
        if (!GROQ_API_KEY) {
            apiModal.style.display = "flex";
            return false;
        }
        return true;
    }

    // Textarea Auto-height on typing (Mobile Friendly)
    diseaseInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    // Reset Form Event
    newRxBtn.addEventListener("click", () => {
        diseaseInput.value = "";
        diseaseInput.style.height = "auto";
        rxOutput.innerHTML = `<div class="placeholder-text">👈 Enter symptoms on the left, select your preferred language, and click <strong>"Generate Prescription"</strong>.</div>`;
        rxDisease.textContent = "--";
        rxDate.textContent = "--/--/----";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Generate Prescription Event
    generateBtn.addEventListener("click", async () => {
        const diseaseText = diseaseInput.value.trim();
        if (!diseaseText) {
            alert("Please enter symptoms or condition!");
            diseaseInput.focus();
            return;
        }

        if (!checkApiKey()) return;

        // Get selected prescription output language
        const selectedLang = document.querySelector('input[name="rxLang"]:checked').value;

        // UI Loading State
        loader.style.display = "block";
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";

        // Dynamic System Prompt based on selected language
        let systemPrompt = "";

        if (selectedLang === "bn") {
            systemPrompt = `
            You are an experienced medical specialist AI (Dr. Sami AI).
            Generate the ENTIRE prescription STRICTLY IN BENGALI (বাংলা) LANGUAGE.

            Bengali Prescription Format:
            ### 🩺 সম্ভাব্য শারীরিক পর্যবেক্ষণ
            [সংক্ষিপ্ত পর্যবেক্ষণ]

            ### 📋 প্রয়োজনীয় পরীক্ষাসমূহ (Diagnostic Tests)
            - [পরীক্ষার নাম] - (কারণ)

            ### 💊 ওষুধ সেবনের নির্দেশিকা (Rx)
            ১. **[ওষুধের নাম]** - [মাত্রা: যেমন ১-০-১] - [নিয়ম: খাওয়ার পর] - [মেয়াদ: ৫ দিন]

            ### 📝 পরামর্শ ও নিয়মাবলী
            - [পরামর্শ ১]

            ### 🚨 জরুরি সতর্কতা (Red Flags)
            - [হাসপাতালে যাওয়ার জরুরি লক্ষণ]
            `;
        } else {
            systemPrompt = `
            You are an experienced medical specialist AI (Dr. Sami AI).
            Generate the ENTIRE prescription STRICTLY IN ENGLISH LANGUAGE.

            English Prescription Format:
            ### 🩺 Clinical Assessment & Diagnosis
            [Brief clinical observation]

            ### 📋 Recommended Diagnostic Tests
            - [Test Name] - (Reason)

            ### 💊 Prescribed Medications (Rx)
            1. **[Medication Name]** - [Dosage: e.g. 1-0-1] - [Timing: e.g. After meals] - [Duration: 5 days]

            ### 📝 Advice & Care Guidelines
            - [Care Tip 1]

            ### 🚨 Emergency Red Flags
            - [Warning symptoms requiring immediate hospital visit]
            `;
        }

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Patient Symptoms / Condition: ${diseaseText}` }
                    ],
                    temperature: 0.3
                })
            });

            const data = await response.json();

            if (data.error) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("DR_SAMI_GROQ_KEY");
                    GROQ_API_KEY = "";
                    throw new Error("Invalid API Key! Key has been reset. Please update your API Key.");
                }
                throw new Error(data.error.message || "API error occurred.");
            }

            const aiResponse = data.choices[0].message.content;
            
            // Set Date & Info
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            rxDate.textContent = today;
            rxDisease.textContent = diseaseText.length > 22 ? diseaseText.substring(0, 22) + "..." : diseaseText;
            
            // Format Response to HTML
            rxOutput.innerHTML = formatMarkdown(aiResponse);

            // Save History
            saveToHistory(diseaseText, aiResponse, today);

            // Auto-scroll on Mobile Devices
            if (window.innerWidth <= 768) {
                rxOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            loader.style.display = "none";
            generateBtn.disabled = false;
            generateBtn.style.opacity = "1";
        }
    });

    // Clean Markdown Formatter
    function formatMarkdown(text) {
        if (!text) return "";
        let html = text
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '<br>')
            .replace(/\n/g, '<br>');

        return html.replace(/<li>/g, '<ul style="margin: 4px 0; padding-left: 18px;"><li>').replace(/<\/li>/g, '</li></ul>');
    }

    // Local Storage History Management
    let history = JSON.parse(localStorage.getItem("DR_SAMI_RX_HISTORY")) || [];

    function saveToHistory(disease, result, date) {
        const item = { id: Date.now(), disease, result, date };
        history.unshift(item);
        if (history.length > 8) history.pop();
        localStorage.setItem("DR_SAMI_RX_HISTORY", JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = "";
        
        if (history.length === 0) {
            historyList.innerHTML = `<div style="font-size: 12px; color: #94a3b8;">No previous prescriptions found.</div>`;
            return;
        }

        history.forEach(item => {
            const div = document.createElement("div");
            div.className = "history-item";
            div.innerHTML = `<strong>${item.disease}</strong><br><small style="color:#94a3b8; font-size: 11px;">${item.date}</small>`;
            div.addEventListener("click", () => {
                diseaseInput.value = item.disease;
                rxDate.textContent = item.date;
                rxDisease.textContent = item.disease.length > 22 ? item.disease.substring(0, 22) + "..." : item.disease;
                rxOutput.innerHTML = formatMarkdown(item.result);
                
                if (window.innerWidth <= 768) {
                    rxOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            historyList.appendChild(div);
        });
    }

    renderHistory();
});
