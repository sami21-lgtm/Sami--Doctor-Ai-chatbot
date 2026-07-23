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

    // Auto Textarea Height Adjustment
    diseaseInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    // Reset Form & Workspace
    newRxBtn.addEventListener("click", () => {
        diseaseInput.value = "";
        diseaseInput.style.height = "auto";
        rxOutput.innerHTML = `<div class="placeholder-text">👈 Enter patient symptoms on the left and click <strong>"Generate Prescription"</strong>.</div>`;
        rxDisease.textContent = "--";
        rxDate.textContent = "--/--/----";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Generate Prescription
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

        // 🎯 STRICT ENGLISH SYSTEM PROMPT WITH TOP BANGLADESHI PHARMA DATABASE
        const systemPrompt = `
        You are Dr. Sami AI, an expert specialist physician with high-level clinical reasoning and complete mastery of global & Bangladeshi pharmacology.
        Generate an ACCURATE, EVIDENCE-BASED MEDICAL PRESCRIPTION matching the exact medical condition or symptoms provided by the user.

        STRICT RULES:
        1. OUTPUT LANGUAGE: MUST BE STRICTLY AND 100% IN ENGLISH. Do NOT write any Bengali words in the prescription output.
        
        2. TOP PHARMA BRAND INTEGRATION: Dynamically select standard, high-quality brand medicines matching the specific disease from Bangladesh's premier pharmaceutical manufacturers:
           - Square Pharmaceuticals PLC (e.g., Napa, Seclo, Alatrol, Xinc)
           - Incepta Pharmaceuticals Ltd. (e.g., Sergel, Osartil, Pantonix, Monas)
           - Beximco Pharmaceuticals Ltd. (e.g., Napa Extra, Tusca, Neocase, Ace)
           - Renata PLC (e.g., Maxpro, Algin, Furocef, Rolac)
           - Eskayef Pharmaceuticals / SK+F (e.g., Entac, Gastrodex, Bizoran, Esonix)
           - Healthcare Pharmaceuticals Ltd. (e.g., Egloc, Losectil, Brozedex)
           - Aristopharma Ltd. (e.g., Amodis, Omep, Aristovit)
           - The ACME Laboratories Ltd. (e.g., Tenoloc, Acme's Fast, Acidex)

        3. ABSOLUTE MEDICAL SAFETY & ACCURACY:
           - MATCH DISEASE EXACTLY: Whether symptoms relate to Fever, Hypertension, Diabetes, Asthma, Gastritis, Skin Infection, Pain, Anxiety, Cough, or Eye issues—prescribe accurate first-line drugs for THAT specific medical issue.
           - NO BANNED/OBSOLETE DRUGS: Strictly NEVER prescribe Ranitidine. Use modern PPIs (Esomeprazole, Omeprazole, Rabeprazole, Dexlansoprazole) for acidity/gastric protection.
           - NO DUPLICATE DRUGS: Never prescribe two medicines with identical generic active ingredients in the same prescription.
           - ANTIBIOTIC STEWARDSHIP: Prescribe antibiotics ONLY if clear bacterial infection or severe systemic illness is evident. Do not prescribe antibiotics for simple viral colds or 1-2 days mild fevers.

        4. EXACT OUTPUT STRUCTURE REQUIRED:
           ### 🩺 Clinical Assessment & Diagnosis
           [Precise clinical evaluation matching the patient's condition]

           ### 📋 Recommended Diagnostic Tests
           - [Test Name] - (Reason)

           ### 💊 Prescribed Medications (Rx)
           1. **[Form] [Brand Name] [Dose] ([Generic Name])** - [Company Name] - [Dosage: 1-0-1] - [Timing: Before/After meals] - [Duration: 5 days]

           ### 📝 Advice & Care Guidelines
           - [Condition-specific lifestyle and dietary advice]

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
                    temperature: 0.0 // Zero temperature ensures consistent, stable clinical outputs
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
            saveToHistory(diseaseText, aiResponse, today);

            if (window.innerWidth <= 768) {
                rxOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            alert("Error: " + error.message);
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
                ⚡ Prescription generated by Dr. Sami AI System | Developed by <strong>Md. Emtiaz Hossain Sami</strong>
            </div>
        `;

        return html;
    }

    // LocalStorage History Functions
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
                rxDisease.textContent = item.disease.length > 25 ? item.disease.substring(0, 25) + "..." : item.disease;
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
