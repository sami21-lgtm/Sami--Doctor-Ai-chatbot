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

    // UI Translation Dictionary for instant language switching
    const uiTranslations = {
        bn: {
            subtitle: "এআই বিশেষজ্ঞ চিকিৎসক ও ডিজিটাল প্রেসক্রিপশন সিস্টেম",
            symptomTitle: "📝 রোগীর লক্ষণ ও উপসর্গ",
            symptomDesc: "রোগীর সমস্যা, জ্বর, ব্যথা বা অন্য যেকোনো লক্ষণ বিস্তারিত লিখুন:",
            placeholder: "যেমন: ২ দিন ধরে জ্বর, শুকনো কাশি এবং পেটে গ্যাস...",
            genBtn: "✨ প্রেসক্রিপশন তৈরি করুন",
            resetBtn: "🔄 রিসেট",
            historyTitle: "📜 পূর্ববর্তী প্রেসক্রিপশন হিস্ট্রি",
            labelDate: "তারিখ:",
            labelSymptom: "সমস্যা:",
            loaderText: "ডাক্তার এআই উপসর্গগুলো পর্যবেক্ষণ করে প্রেসক্রিপশন তৈরি করছেন...",
            placeholderRx: "👈 বামপাশে রোগীর লক্ষণ লিখে <strong>\"প্রেসক্রিপশন তৈরি করুন\"</strong> বাটনে চাপ দিন।",
            disclaimer: "⚠️ <em>এটি একটি এআই জেনারেটেড ডিজিটাল প্রেসক্রিপশন। ইমার্জেন্সি অবস্থায় অবিলম্বে নিকটস্থ হাসপাতালে যোগাযোগ করুন।</em>"
        },
        en: {
            subtitle: "AI Specialist Physician & Prescription System",
            symptomTitle: "📝 Patient Symptoms & Condition",
            symptomDesc: "Describe patient symptoms, pain, fever, duration, or medical issues:",
            placeholder: "e.g., High fever for 2 days, dry cough, and gastric acidity...",
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

    // Auto Textarea Height
    diseaseInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });

    // Reset Form
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

        let systemPrompt = "";

        if (selectedLang === "bn") {
            systemPrompt = `
            You are an expert specialist physician AI (Dr. Sami AI) with human doctor level clinical reasoning.
            Generate a HIGHLY ACCURATE, EVIDENCE-BASED MEDICAL PRESCRIPTION matching the patient symptoms.
            Language: STRICTLY IN BENGALI (বাংলা).

            CLINICAL SAFETY RULES:
            1. NO DUPLICATE DRUGS: NEVER give two medicines with identical generic ingredients (e.g., STRICTLY PROHIBITED to give Napa + Napa Extra together or Seclo + Sergel together).
            2. TOP BANGLADESHI PHARMA BRANDS: Use trusted standard brands across Square, Beximco, Incepta, Renata, Healthcare, SK+F, ACI, Opsonin, Aristopharma, ACME, etc.
            3. Exact brand format: **Tab./Cap./Syr. Brand Name Weight (Generic Name)**
            4. Use English digits for dosages (1-0-1, 1-0-0) for clear rendering.

            Bengali Prescription Output Structure:
            ### 🩺 সম্ভাব্য শারীরিক পর্যবেক্ষণ
            [লক্ষণ অনুযায়ী ক্লিনিক্যাল পর্যবেক্ষণ]

            ### 📋 প্রয়োজনীয় পরীক্ষাসমূহ (Diagnostic Tests)
            - [প্রয়োজনীয় ১-২টি ল্যাব টেস্ট] - (কারণ)

            ### 💊 ওষুধ সেবনের নির্দেশিকা (Rx)
            1. **[ওষুধের নাম (জেনেরিক)]** - [মাত্রা: 1-0-1] - [নিয়ম: খাওয়ার পর/আগে] - [মেয়াদ: 5 দিন]

            ### 📝 পরামর্শ ও নিয়মাবলী
            - [রোগীর জন্য সাধারণ পরামর্শ]

            ### 🚨 জরুরি সতর্কতা (Red Flags)
            - [জরুরি জটিলতার সতর্কতা]
            `;
        } else {
            systemPrompt = `
            You are an expert specialist physician AI (Dr. Sami AI) with human doctor level reasoning.
            Generate a HIGHLY ACCURATE, EVIDENCE-BASED MEDICAL PRESCRIPTION matching exact patient symptoms.
            Language: STRICTLY IN ENGLISH.

            CLINICAL SAFETY RULES:
            1. NO DUPLICATE DRUGS: NEVER give two medicines with identical generic ingredients (e.g. NEVER give Napa + Napa Extra together).
            2. TOP BANGLADESHI PHARMA BRANDS: Use authentic brands across Square, Beximco, Incepta, Renata, Healthcare, SK+F, ACI, Opsonin, etc.
            3. Format: **Tab./Cap./Syr. Brand Name Weight (Generic Name)**
            4. Clear dosage digits (1-0-1, 0-0-1).

            English Prescription Output Structure:
            ### 🩺 Clinical Assessment & Diagnosis
            [Precise clinical evaluation]

            ### 📋 Recommended Diagnostic Tests
            - [Test Name] - (Reason)

            ### 💊 Prescribed Medications (Rx)
            1. **[Brand Name (Generic)]** - [Dosage: 1-0-1] - [Timing: After/Before meals] - [Duration: 5 days]

            ### 📝 Advice & Care Guidelines
            - [Condition specific guidelines]

            ### 🚨 Emergency Red Flags
            - [Critical warning symptoms]
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
                        { role: "user", content: `Patient Symptoms: ${diseaseText}` }
                    ],
                    temperature: 0.1
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

    // Formatter with Branding Watermark
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

    // History Storage
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

    // Set initial default UI language
    updateLanguageUI('bn');
    renderHistory();
});
