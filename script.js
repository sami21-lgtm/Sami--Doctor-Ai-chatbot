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
    const langRadios = document.querySelectorAll('input[name="rxLang"]');

    // UI Translation Dictionary for Instant Interface Switching
    const uiTranslations = {
        bn: {
            subtitle: "এআই বিশেষজ্ঞ চিকিৎসক ও ডিজিটাল প্রেসক্রিপশন সিস্টেম",
            symptomTitle: "📝 রোগীর লক্ষণ ও উপসর্গ",
            symptomDesc: "রোগীর সমস্যা, জ্বর, প্রেসার, চর্মরোগ, হাঁপানি বা অন্য যেকোনো লক্ষণ লিখুন:",
            placeholder: "যেমন: ৩ দিন ধরে জ্বর, বুক জ্বালাপোড়া এবং শুকনো কাশি...",
            genBtn: "✨ প্রেসক্রিপশন তৈরি করুন",
            resetBtn: "🔄 রিসেট",
            historyTitle: "📜 পূর্ববর্তী প্রেসক্রিপশন হিস্ট্রি",
            labelDate: "তারিখ:",
            labelSymptom: "সমস্যা:",
            loaderText: "ডাক্তার এআই উপসর্গগুলো বিশ্লেষণ করে প্রেসক্রিপশন তৈরি করছেন...",
            placeholderRx: "👈 বামপাশে রোগীর লক্ষণ লিখে <strong>\"প্রেসক্রিপশন তৈরি করুন\"</strong> বাটনে চাপ দিন।",
            disclaimer: "⚠️ <em>এটি একটি এআই জেনারেটেড ডিজিটাল প্রেসক্রিপশন। ইমার্জেন্সি অবস্থায় অবিলম্বে নিকটস্থ হাসপাতালে যোগাযোগ করুন।</em>"
        },
        en: {
            subtitle: "AI Specialist Physician & Prescription System",
            symptomTitle: "📝 Patient Symptoms & Condition",
            symptomDesc: "Describe patient symptoms, pain, BP, skin issues, asthma, or medical conditions:",
            placeholder: "e.g., High fever for 3 days, acidity, and dry cough...",
            genBtn: "✨ Generate Prescription",
            resetBtn: "🔄 Reset",
            historyTitle: "📜 Previous Prescription History",
            labelDate: "Date:",
            labelSymptom: "Symptom:",
            loaderText: "Dr. Sami AI is analyzing symptoms & formulating prescription...",
            placeholderRx: "👈 Enter symptoms on the left and click <strong>\"Generate Prescription\"</strong>.",
            disclaimer: "⚠️ <em>This is an AI-assisted digital prescription. In emergency situations, please visit the nearest hospital immediately.</em>"
        }
    };

    // Update Interface Text based on Selected Language
    function updateLanguageUI(lang) {
        const t = uiTranslations[lang];
        document.getElementById("uiSubtitle").textContent = t.subtitle;
        document.getElementById("uiSymptomTitle").textContent = t.symptomTitle;
        document.getElementById("uiSymptomDesc").textContent = t.symptomDesc;
        diseaseInput.placeholder = t.placeholder;
        document.getElementById("uiGenBtnText").textContent = t.genBtn;
        document.getElementById("uiResetBtnText").textContent = t.resetBtn;
        document.getElementById("uiHistoryTitle").textContent = t.historyTitle;
        document.getElementById("uiLabelDate").textContent = t.labelDate;
        document.getElementById("uiLabelSymptom").textContent = t.labelSymptom;
        document.getElementById("uiLoaderText").textContent = t.loaderText;
        document.getElementById("uiDisclaimer").innerHTML = t.disclaimer;

        if (rxOutput.querySelector('.placeholder-text')) {
            rxOutput.innerHTML = `<div class="placeholder-text">${t.placeholderRx}</div>`;
        }
    }

    // Listen for Language Change Toggle
    langRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateLanguageUI(e.target.value);
        });
    });

    // Auto Textarea Height Adjustment
    diseaseInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    // Reset Form & Workspace
    newRxBtn.addEventListener("click", () => {
        const selectedLang = document.querySelector('input[name="rxLang"]:checked').value;
        diseaseInput.value = "";
        diseaseInput.style.height = "auto";
        rxOutput.innerHTML = `<div class="placeholder-text">${uiTranslations[selectedLang].placeholderRx}</div>`;
        rxDisease.textContent = "--";
        rxDate.textContent = "--/--/----";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Generate Prescription
    generateBtn.addEventListener("click", async () => {
        const diseaseText = diseaseInput.value.trim();
        const selectedLang = document.querySelector('input[name="rxLang"]:checked').value;

        if (!diseaseText) {
            alert(selectedLang === 'bn' ? "অনুগ্রহ করে রোগীর লক্ষণ বা রোগের নাম লিখুন!" : "Please enter patient symptoms or condition!");
            diseaseInput.focus();
            return;
        }

        // UI Loading State
        loader.style.display = "block";
        rxOutput.style.display = "none";
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";

        // 🎯 UNIFIED & DETERMINISTIC CLINICAL PROTOCOL (সকল রোগের জন্য সেরা কোম্পানির ওষুধ)
        const baseMedicalRules = `
        You are Dr. Sami AI, an expert specialist physician with high-level clinical reasoning and complete mastery of global & Bangladeshi pharmacology.
        Generate an ACCURATE, EVIDENCE-BASED MEDICAL PRESCRIPTION matching the exact medical condition or symptoms provided by the user.

        STRICT PHARMACOPEIA & BRAND RULES:
        1. TOP PHARMA BRAND INTEGRATION: Select high-quality, authentic brand medicines dynamically matching the user's disease from premier manufacturers:
           - Square Pharmaceuticals PLC (e.g., Napa, Seclo, Alatrol, Xinc)
           - Incepta Pharmaceuticals Ltd. (e.g., Sergel, Osartil, Pantonix, Monas)
           - Beximco Pharmaceuticals Ltd. (e.g., Napa Extra, Tusca, Neocase, Ace)
           - Renata PLC (e.g., Maxpro, Algin, Furocef, Rolac)
           - Eskayef Pharmaceuticals / SK+F (e.g., Entac, Gastrodex, Bizoran, Esonix)
           - Healthcare Pharmaceuticals Ltd. (e.g., Egloc, Losectil, Brozedex)
           - Aristopharma Ltd. (e.g., Amodis, Omep, Aristovit)
           - The ACME Laboratories Ltd. (e.g., Tenoloc, Acme's Fast, Acidex)
        
        2. BENGALI VS ENGLISH CONSISTENCY:
           - The prescribed drug names, generic names, exact dosage (1-0-1), duration, and selected manufacturer MUST BE 100% IDENTICAL regardless of whether output language is Bengali or English. 
           - Do NOT change medicine choices or brands when switching language. Only translate the explanations, advice, and category headers.

        3. ABSOLUTE MEDICAL SAFETY & ACCURACY:
           - MATCH DISEASE EXACTLY: Whether it is Hypertension, Diabetes, Asthma, Gastritis, Fever, Skin Infection, Pain, Anxiety, Cough, Eye issue, or Allergy—prescribe first-line standard drugs for THAT specific condition.
           - NO BANNED/OBSOLETE DRUGS: Strictly NEVER prescribe Ranitidine. Always use modern PPIs (Esomeprazole, Omeprazole, Rabeprazole, Dexlansoprazole).
           - NO DUPLICATE DRUGS: Never prescribe two medicines with identical active ingredients in the same prescription.
           - ANTIBIOTIC STEWARDSHIP: Prescribe antibiotics ONLY when clear bacterial infection or severe systemic symptoms are present. Do not give antibiotics for 1-2 day simple cold/fever.

        4. DRUG FORMAT: **[Form] [Brand Name] [Dose] ([Generic Name])** - [Company Name]
           Example: **Tab. Sergel 20mg (Esomeprazole)** - Incepta Pharmaceuticals
        5. DOSAGE DIGITS: Use standard clear English numerals (1-0-1, 1-0-0, 0-0-1, 0-1-0) in both languages.
        `;

        let systemPrompt = "";

        if (selectedLang === "bn") {
            systemPrompt = `
            ${baseMedicalRules}
            Output Language: STRICTLY BENGALI (বাংলা).

            Required Bengali Prescription Structure:
            ### 🩺 সম্ভাব্য শারীরিক পর্যবেক্ষণ
            [রোগীর সমস্যা অনুযায়ী নির্ভুল ক্লিনিক্যাল মূল্যায়ন]

            ### 📋 প্রয়োজনীয় পরীক্ষাসমূহ (Diagnostic Tests)
            - [নির্দিষ্ট রোগের জন্য প্রয়োজনীয় ল্যাব টেস্ট] - (কারণ)

            ### 💊 ওষুধ সেবনের নির্দেশিকা (Rx)
            1. **[ফর্ম ব্র্যান্ড নাম ডোজ (জেনেরিক নাম)]** - [কোম্পানির নাম] - [মাত্রা: 1-0-1] - [নিয়ম: খাওয়ার আগে/পরে] - [মেয়াদ: 5 দিন]

            ### 📝 পরামর্শ ও নিয়মাবলী
            - [রোগীর নির্দিষ্ট রোগের উপযোগী খাদ্য ও লাইফস্টাইল সংক্রান্ত পরামর্শ]

            ### 🚨 জরুরি সতর্কতা (Red Flags)
            - [উক্ত জটিলতায় কখন দ্রুত হাসপাতালে যোগাযোগ করতে হবে]
            `;
        } else {
            systemPrompt = `
            ${baseMedicalRules}
            Output Language: STRICTLY ENGLISH.

            Required English Prescription Structure:
            ### 🩺 Clinical Assessment & Diagnosis
            [Precise clinical evaluation matching the patient's exact disease]

            ### 📋 Recommended Diagnostic Tests
            - [Test Name] - (Reason)

            ### 💊 Prescribed Medications (Rx)
            1. **[Form Brand Name Dose (Generic)]** - [Company Name] - [Dosage: 1-0-1] - [Timing: Before/After meals] - [Duration: 5 days]

            ### 📝 Advice & Care Guidelines
            - [Condition specific lifestyle & dietary guidance]

            ### 🚨 Emergency Red Flags
            - [Critical warning signs requiring immediate hospital visit]
            `;
        }

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Patient Condition / Symptoms: ${diseaseText}` }
                    ],
                    temperature: 0.0 // 🎯 তাপমাত্রা 0.0 থাকায় ভাষা পাল্টালেও ওষুধ পরিবর্তন হবে না
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

    // Clean Markdown Formatter with Branding Signature
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

    // Set Initial Default UI Language
    updateLanguageUI('bn');
    renderHistory();
});
