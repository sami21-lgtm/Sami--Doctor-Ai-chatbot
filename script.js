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

    // LocalStorage Keys
    const HISTORY_KEY = "DR_SAMI_RX_HISTORY";
    const ACTIVE_RX_KEY = "DR_SAMI_LAST_ACTIVE_RX";

    // Auto Textarea Height Adjustment
    diseaseInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    // Restore Last Prescription on Page Reload
    function restoreActivePrescription() {
        const activeData = JSON.parse(localStorage.getItem(ACTIVE_RX_KEY));
        if (activeData && activeData.result) {
            rxDate.textContent = activeData.date;
            rxDisease.textContent = activeData.disease.length > 25 ? activeData.disease.substring(0, 25) + "..." : activeData.disease;
            diseaseInput.value = activeData.disease;
            rxOutput.innerHTML = formatMarkdown(activeData.result);
        }
    }

    // Reset Form & Clear Active Prescription Memory
    newRxBtn.addEventListener("click", () => {
        diseaseInput.value = "";
        diseaseInput.style.height = "auto";
        rxOutput.innerHTML = `<div class="placeholder-text">👈 Enter patient symptoms on the left and click <strong>"Generate Prescription"</strong>.</div>`;
        rxDisease.textContent = "--";
        rxDate.textContent = "--/--/----";
        localStorage.removeItem(ACTIVE_RX_KEY); // Clear saved session
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Generate Prescription Event Listener
    generateBtn.addEventListener("click", async () => {
        const diseaseText = diseaseInput.value.trim();

        if (!diseaseText) {
            alert("Please enter patient symptoms or medical condition!");
            diseaseInput.focus();
            return;
        }

        // UI Loading State
        loader.style.display = "block";
        rxOutput.style.display = "none";
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";

        // 🎯 STRICT CLINICAL SAFETY & ALL-MEDICINE COMPREHENSIVE PROMPT
        const systemPrompt = `
        You are Dr. Sami AI, an expert specialist physician with high-level clinical reasoning and complete access to the full pharmacopeia of global and Bangladeshi pharmaceuticals.
        Analyze the patient's symptoms and generate a highly precise, evidence-based prescription.

        🏛️ COMPREHENSIVE BANGLADESHI PHARMA DATABASE ACCESS:
        You are strictly instructed to tap into your COMPLETE internal medical index for all drugs manufactured by Bangladesh's premier pharmaceutical companies:
        - Square Pharmaceuticals PLC
        - Incepta Pharmaceuticals Ltd.
        - Beximco Pharmaceuticals Ltd.
        - Renata PLC
        - Eskayef Pharmaceuticals (SK+F)
        - Healthcare Pharmaceuticals Ltd.
        - Aristopharma Ltd.
        - The ACME Laboratories Ltd.

        DO NOT restrict yourself to basic medications. Match ANY medical condition (Cardiovascular, Endocrine/Diabetes, Respiratory, Dermatological, Gastrointestinal, Neurological, ENT, Nephrology, Infection, etc.) with the EXACT first-line standard brand drug produced by any of these top 8 companies.

        🚨 CRITICAL PATIENT SAFETY GUARDRAILS:
        1. EMERGENCY REDIRECTION: If symptoms suggest LIFE-THREATENING EMERGENCIES (e.g., severe chest pain, heart attack, stroke/paralysis, severe breathing distress, massive bleeding, loss of consciousness), DO NOT PRESCRIBE MEDICINES.
           Output: "🚨 EMERGENCY ALERT: Please visit the nearest Hospital Emergency Room or call 999 immediately."
        2. STRICTLY BANNED DRUGS:
           - NEVER prescribe Sedatives / Sleeping Pills (Benzodiazepines).
           - NEVER prescribe Oral Steroids for routine complaints.
           - NEVER prescribe Controlled Narcotics or habit-forming painkillers (e.g., Morphine, Pethidine, Tramadol).
           - NEVER prescribe obsolete/banned drugs like Ranitidine. Use modern PPIs (Esomeprazole, Omeprazole, Rabeprazole).
        3. NO DUPLICATES: Never prescribe two brand medicines containing identical generic ingredients in one prescription.
        4. ANTIBIOTIC STEWARDSHIP: Do NOT give antibiotics for simple viral fevers or mild colds (1-3 days). Reserve antibiotics for confirmed/severe bacterial infections.

        📝 OUTPUT FORMAT RULES:
        - Output MUST BE STRICTLY AND 100% IN ENGLISH ONLY.
        - Output Structure:
          ### 🩺 Clinical Assessment & Diagnosis
          [Precise clinical evaluation matching the patient's condition]

          ### 📋 Recommended Diagnostic Tests
          - [Test Name] - (Clinical reason)

          ### 💊 Prescribed Medications (Rx)
          1. **[Form] [Brand Name] [Dose] ([Generic Name])** - [Company Name] - [Dosage: 1-0-1] - [Timing: Before/After meals] - [Duration: 5 days]

          ### 📝 Advice & Care Guidelines
          - [Condition-specific lifestyle, dietary, and resting advice]

          ### 🚨 Emergency Red Flags
          - [Critical warning signs requiring immediate hospital visit]
        `;

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Patient Symptoms / Condition: ${diseaseText}` }
                    ],
                    temperature: 0.0 // Zero temperature ensures stable & consistent outputs
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error?.message || data.error || "Server Error!");
            }

            const aiResponse = data.choices[0].message.content;
            
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            rxDate.textContent = today;
            rxDisease.textContent = diseaseText.length > 25 ? diseaseText.substring(0, 25) + "..." : diseaseText;
            
            rxOutput.innerHTML = formatMarkdown(aiResponse);
            
            // Save to active state (Persistent across page reloads)
            localStorage.setItem(ACTIVE_RX_KEY, JSON.stringify({ disease: diseaseText, result: aiResponse, date: today }));
            
            // Save to history list
            saveToHistory(diseaseText, aiResponse, today);

            if (window.innerWidth <= 768) {
                rxOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            alert("Error generating prescription: " + error.message);
        } finally {
            loader.style.display = "none";
            rxOutput.style.display = "block";
            generateBtn.disabled = false;
            generateBtn.style.opacity = "1";
        }
    });

    // Clean Markdown Formatter
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
                html += `<div style="margin-left: 15px; margin-bottom: 5px;">• ${content}</div>`;
            } else if (/^\d+\./.test(trimmed)) {
                let content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<div style="margin-bottom: 8px; font-weight: 500;">${content}</div>`;
            } else if (trimmed !== "") {
                let content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p style="margin-bottom: 6px;">${content}</p>`;
            }
        });

        html += `
            <hr style="margin-top: 25px; border: 0; border-top: 1px dashed #cbd5e1;">
            <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 12px;">
                ⚠️ <strong>Safety Disclaimer:</strong> This is an AI-assisted digital prescription draft. Please consult a registered physician before taking any medication.<br>
                ⚡ Prescriptions generated by Dr. Sami AI System | Developed by <strong>Md. Emtiaz Hossain Sami</strong>
            </div>
        `;

        return html;
    }

    // LocalStorage History Functions
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    function saveToHistory(disease, result, date) {
        const item = { id: Date.now(), disease, result, date };
        history.unshift(item);
        if (history.length > 8) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
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
                rxDisease.textContent = item.disease.length > 25 ? item.disease.substring(0, 25) + "..." : item.disease;
                rxOutput.innerHTML = formatMarkdown(item.result);
                
                // Save clicked item as active rx
                localStorage.setItem(ACTIVE_RX_KEY, JSON.stringify({ disease: item.disease, result: item.result, date: item.date }));

                if (window.innerWidth <= 768) {
                    rxOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            historyList.appendChild(div);
        });
    }

    // Initialize UI on Page Load
    restoreActivePrescription();
    renderHistory();
});
