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
    const apiKeyBtn = document.getElementById("apiKeyBtn");

    // Hide API key button as serverless function handles it
    if (apiKeyBtn) {
        apiKeyBtn.style.display = "none";
    }

    // Textarea Auto-height Adjustment
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
            alert("অনুগ্রহ করে রোগীর লক্ষণ বা রোগের নাম লিখুন!");
            diseaseInput.focus();
            return;
        }

        // Get selected prescription output language
        const selectedLang = document.querySelector('input[name="rxLang"]:checked').value;

        // UI Loading State
        loader.style.display = "block";
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";

        let systemPrompt = "";

        if (selectedLang === "bn") {
            systemPrompt = `
            You are an expert specialist physician AI (Dr. Sami AI).
            Your primary job is to generate a HIGHLY ACCURATE, BALANCED, MEDICAL PRESCRIPTION strictly matching the patient's exact symptoms.
            Generate the ENTIRE prescription STRICTLY IN BENGALI (বাংলা) LANGUAGE.

            STRICT MEDICAL ACCURACY & SAFETY RULES:
            1. NO DUPLICATE DRUGS: NEVER prescribe two medicines containing the same active generic ingredient together (e.g., STRICTLY PROHIBITED to give Napa 500mg and Napa Extra together). Choose only ONE best medicine per medical need.
            2. MATCH MEDICINE TO SYMPTOMS PERFECTLY:
               - Fever / Body Ache ONLY: Tab. Napa 500mg OR Tab. Ace 500mg (1-0-1 or as needed). DO NOT give Napa if fever/pain is NOT mentioned.
               - Allergy / Cold / Sneezing: Tab. Fexo 120mg OR Tab. Alatrol 10mg OR Tab. Bilasten 20mg.
               - Gastric / Acidity / Heartburn: Cap. Seclo 20mg OR Cap. Sergel 20mg OR Cap. Nexum 20mg (30 mins before meals).
               - Cough: Dry cough -> Syr. Miracof; Productive cough -> Syr. Adovas / Syr. Brofex.
               - Loose Motion / Diarrhea: ORSaline-N + Cap. Entogermina / Zinc.
               - Severe Bacterial Infection: Tab. Zimax 500mg OR Cap. Cef-3 200mg.
            3. MULTI-SYMPTOM COVERAGE: If the patient has multiple symptoms (e.g., "Fever and Gastric" or "Cold and Cough"), prescribe 1 drug for each symptom (e.g., 1 Painkiller + 1 Antihistamine + 1 PPI Gastric protector).
            4. BRAND & GENERIC FORMAT: Write Bangladeshi popular brands with generics in brackets:
               Format: **Tab./Cap./Syr. Brand Name Weight (Generic Name)**
               Example: **Cap. Seclo 20mg (Omeprazole)**
            5. DOSAGE & TIMING: Use English digits (1-0-1, 0-0-1, 1-0-0) for clean rendering.

            Bengali Output Format:
            ### 🩺 সম্ভাব্য শারীরিক পর্যবেক্ষণ
            [লক্ষণ অনুযায়ী নিখুঁত ক্লিনিক্যাল পর্যবেক্ষণ]

            ### 📋 প্রয়োজনীয় পরীক্ষাসমূহ (Diagnostic Tests)
            - [প্রয়োজনীয় পরীক্ষা] - (কারণ)

            ### 💊 ওষুধ সেবনের নির্দেশিকা (Rx)
            1. **[ওষুধ ১]** - [মাত্রা: 1-0-1] - [নিয়ম: খাওয়ার পর] - [মেয়াদ: 5 দিন]
            2. **[ওষুধ ২]** - [মাত্রা: 1-0-0] - [নিয়ম: খাওয়ার ৩০ মি. আগে] - [মেয়াদ: 7 দিন]

            ### 📝 পরামর্শ ও নিয়মাবলী
            - [বিশেষ খাদ্যবিধি ও সাধারণ পরামর্শ]

            ### 🚨 জরুরি সতর্কতা (Red Flags)
            - [জরুরি লক্ষণ]
            `;
        } else {
            systemPrompt = `
            You are an expert specialist physician AI (Dr. Sami AI).
            Your primary job is to generate a HIGHLY ACCURATE, BALANCED MEDICAL PRESCRIPTION strictly matching the patient's exact symptoms.
            Generate the ENTIRE prescription STRICTLY IN ENGLISH LANGUAGE.

            STRICT MEDICAL ACCURACY & SAFETY RULES:
            1. NO DUPLICATE DRUGS: NEVER prescribe two medicines containing the same generic (e.g., DO NOT prescribe Napa + Napa Extra together).
            2. ACCURATE MATCHING:
               - Cold/Allergy: Tab. Fexo 120mg / Tab. Alatrol 10mg.
               - Gastric/GERD: Cap. Seclo 20mg / Cap. Sergel 20mg.
               - Fever/Pain: Tab. Napa 500mg ONLY if fever/pain is present.
               - Cough: Syr. Miracof / Syr. Adovas.
               - Infections: Targeted Antibiotic (e.g. Tab. Zimax 500mg).
            3. BRAND & GENERIC FORMAT: **Tab./Cap./Syr. Brand Name Weight (Generic Name)**.
            4. DOSAGE: Use clear digits like 1-0-1, 0-0-1 with timings and duration.

            English Output Format:
            ### 🩺 Clinical Assessment & Diagnosis
            [Accurate clinical observation]

            ### 📋 Recommended Diagnostic Tests
            - [Test Name] - (Reason)

            ### 💊 Prescribed Medications (Rx)
            1. **[Medication Brand (Generic)]** - [Dosage: 1-0-1] - [Timing: After/Before meals] - [Duration: 5 days]

            ### 📝 Advice & Care Guidelines
            - [Care Tip]

            ### 🚨 Emergency Red Flags
            - [Red flag symptoms]
            `;
        }

        try {
            // Call serverless API endpoint
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Patient Symptoms / Condition: ${diseaseText}` }
                    ],
                    temperature: 0.1
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error?.message || data.error || "Server response error!");
            }

            const aiResponse = data.choices[0].message.content;
            
            // Set Date & Patient Info
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            rxDate.textContent = today;
            rxDisease.textContent = diseaseText.length > 22 ? diseaseText.substring(0, 22) + "..." : diseaseText;
            
            // Format Response to Clean HTML
            rxOutput.innerHTML = formatMarkdown(aiResponse);

            // Save to Local History
            saveToHistory(diseaseText, aiResponse, today);

            // Auto-scroll on Mobile
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

    // Clean Markdown Formatter Function
    function formatMarkdown(text) {
        if (!text) return "";
        let lines = text.split('\n');
        let html = "";

        lines.forEach(line => {
            let trimmed = line.trim();
            if (trimmed.startsWith("### ")) {
                html += `<h3>${trimmed.replace("### ", "")}</h3>`;
            } else if (trimmed.startsWith("- ")) {
                let content = trimmed.replace("- ", "").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<div style="margin-left: 15px; margin-bottom: 4px;">• ${content}</div>`;
            } else if (/^\d+\./.test(trimmed)) {
                let content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<div style="margin-bottom: 6px; font-weight: 500;">${content}</div>`;
            } else if (trimmed !== "") {
                let content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p style="margin-bottom: 6px;">${content}</p>`;
            }
        });

        return html;
    }

    // Local Storage History
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
                rxDisease.textContent = item.disease.length > 22 ? item.disease.substring(0, 22) + "..." : diseaseText;
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
