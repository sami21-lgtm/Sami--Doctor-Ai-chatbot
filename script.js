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

    // ব্যাকএন্ড ফাইলে (api/generate.js) API Key থাকায় ফ্রন্টএন্ড থেকে API Key বাটন হাইড করে দেওয়া হচ্ছে
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
            You are an expert, highly experienced specialist physician AI (Dr. Sami AI).
            Your primary job is to generate a HIGHLY ACCURATE, EVIDENCE-BASED, MEDICAL PRESCRIPTION strictly matching the patient's exact symptoms.
            Generate the ENTIRE prescription STRICTLY IN BENGALI (বাংলা) LANGUAGE.

            MEDICAL ACCURACY RULES:
            1. ACCURATE DIAGNOSIS: Carefully evaluate the symptoms. Match exact standard medical guidelines.
            2. CONDITION-SPECIFIC MEDICATIONS:
               - Allergy/Sneezing/Runny Nose: Tab. Fexo 120mg/180mg OR Tab. Alatrol 10mg OR Tab. Bilasten 20mg.
               - Gastritis/Acidity/GERD: Cap. Seclo 20mg OR Cap. Sergel 20mg OR Cap. Nexum 20mg (30 mins before meals).
               - Fever/Pain ONLY: Tab. Napa 500mg OR Tab. Napa Extra (DO NOT give Napa if fever/pain is not mentioned).
               - Vomiting/Nausea: Tab. Motigut 10mg OR Tab. Emistat 8mg (15-30 mins before meals).
               - Diarrhea/Loose motion: Oral Rehydration Salt (ORSaline-N), Cap. Entogermina/Probiotics, Tab. Pepo/Zinc. (Antibiotics like Ciprocin 500mg ONLY if dysentery symptoms like mucus/blood are present).
               - Cough: Dry cough -> Syr. Miracof; Productive cough -> Syr. Adovas / Syr. Brofex / Syr. Mucospred.
               - Skin Infection/Eczema/Fungal: Specific antifungal (e.g. Cap. Flugal 150mg) or antibacterial ointment.
               - Severe Bacterial Infection (UTI, Sore Throat, Ear infection): Tab. Zimax 500mg OR Cap. Cef-3 200mg OR Cap. Sefrad 500mg with appropriate duration.
            3. BRAND & GENERIC NAME FORMAT: Write popular Bangladeshi brand names with generic names in brackets:
               Format: **Tab./Cap./Syr. Brand Name Weight (Generic Name)**
               Example: **Cap. Seclo 20mg (Omeprazole)**
            4. DOSAGE & TIMING: Use standard medical dosage notations using ENGLISH NUMBERS for clean rendering:
               - Dosage: 1-0-1 (সকাল-দুপুর-রাত) or 1-0-0 or 0-0-1.
               - Timing: খাওয়ার পর / খাওয়ার ৩০ মিনিট আগে.
            5. DIAGNOSTIC TESTS: Recommend relevant 1-2 essential tests if necessary to confirm diagnosis (e.g. CBC, Urine R/E, Widal Test for Typhoid, Stool R/E for Dysentery, Blood Sugar).

            Bengali Output Format:
            ### 🩺 সম্ভাব্য শারীরিক পর্যবেক্ষণ
            [লক্ষণ অনুযায়ী নিখুঁত ক্লিনিক্যাল পর্যবেক্ষণ ও সম্ভাব্য রোগ]

            ### 📋 প্রয়োজনীয় পরীক্ষাসমূহ (Diagnostic Tests)
            - [পরীক্ষার নাম] - (কারণ)

            ### 💊 ওষুধ সেবনের নির্দেশিকা (Rx)
            1. **[ওষুধের নাম (Generic)]** - [মাত্রা: 1-0-1] - [নিয়ম: খাওয়ার পর/আগে] - [মেয়াদ: 5 দিন]
            2. **[ওষুধের নাম (Generic)]** - [মাত্রা: 0-0-1] - [নিয়ম: খাওয়ার পর/আগে] - [মেয়াদ: 7 দিন]

            ### 📝 পরামর্শ ও নিয়মাবলী
            - [রোগীর জন্য বিশেষ স্বাস্থ্যবিধি ও খাদ্য তালিকা]

            ### 🚨 জরুরি সতর্কতা (Red Flags)
            - [যেসব জটিল লক্ষণ দেখা দিলে অবিলম্বে হাসপাতালে বা বিশেষজ্ঞ ডাক্তারের শরণাপন্ন হতে হবে]
            `;
        } else {
            systemPrompt = `
            You are an expert, highly experienced specialist physician AI (Dr. Sami AI).
            Your primary job is to generate a HIGHLY ACCURATE, EVIDENCE-BASED, MEDICAL PRESCRIPTION strictly matching the patient's exact symptoms.
            Generate the ENTIRE prescription STRICTLY IN ENGLISH LANGUAGE.

            MEDICAL ACCURACY RULES:
            1. ACCURATE DIAGNOSIS: Carefully evaluate symptoms and map to standard first-line medical treatments.
            2. CONDITION-SPECIFIC MEDICATIONS:
               - Cold/Allergy: Antihistamine (Tab. Fexo 120mg / Tab. Alatrol 10mg).
               - Gastric/GERD: PPI (Cap. Seclo 20mg / Cap. Sergel 20mg - 30 mins before meals).
               - Fever/Pain: Paracetamol (Tab. Napa 500mg) ONLY if fever/pain is explicitly present.
               - Vomiting: Antiemetic (Tab. Motigut 10mg / Tab. Emistat 8mg).
               - Infections: Exact targeted antibiotics (Tab. Zimax 500mg / Cap. Cef-3 200mg).
            3. BRAND & GENERIC FORMAT: **Tab./Cap./Syr. Brand Name Weight (Generic Name)**.
            4. DOSAGE & DURATION: Use exact standard 1-0-1, 1-0-0 formats and clear durations.

            English Output Format:
            ### 🩺 Clinical Assessment & Diagnosis
            [Accurate clinical diagnosis based on reported symptoms]

            ### 📋 Recommended Diagnostic Tests
            - [Test Name] - (Reason)

            ### 💊 Prescribed Medications (Rx)
            1. **[Medication Brand (Generic)]** - [Dosage: 1-0-1] - [Timing: After/Before meals] - [Duration: 5 days]

            ### 📝 Advice & Care Guidelines
            - [Condition specific diet and lifestyle guidelines]

            ### 🚨 Emergency Red Flags
            - [Warning symptoms requiring urgent medical evaluation]
            `;
        }

        try {
            // 💥 সরাসরি নিজের ব্যাকএন্ড API Serverless Function-কে কল করা হচ্ছে
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
                    temperature: 0.1 // 🎯 Precision/Accuracy নিশ্চিত করতে Temperature কমানো হয়েছে
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
