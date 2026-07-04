(function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const newChatBtn = document.getElementById('newChatBtn');
    const conversationsList = document.getElementById('conversationsList');
    const messagesContainer = document.getElementById('messagesContainer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const voiceToggleBtn = document.getElementById('voiceToggleBtn');

    let currentConversationId = null;
    let conversations = [];
    let messages = [];
    let voiceEnabled = false;
    let isListening = false;
    let recognition = null;
    const synth = window.speechSynthesis;
    let isProcessing = false;

    function init() {
        loadConversations();
        setupSpeechRecognition();
        setupSpeechSynthesis();
        if (!currentConversationId) showWelcomeScreen(true);
        updateSendButton();
    }

    async function apiCall(endpoint, method='GET', body=null) {
        const options = { method, headers: {'Content-Type': 'application/json'} };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(endpoint, options);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
    }

    async function sendMessage(message) {
        if (isProcessing || !message.trim()) return;
        isProcessing = true;
        updateSendButton();
        showWelcomeScreen(false);

        const userMsg = { role:'user', content:message.trim(), created_at: new Date().toISOString() };
        messages.push(userMsg);
        renderMessages();
        userInput.value = '';
        autoResizeTextarea();
        scrollToBottom();
        showTypingIndicator(true);

        try {
            const data = await apiCall('/api/chat', 'POST', {
                message: message.trim(),
                conversation_id: currentConversationId,
            });
            if (data.conversation_id) currentConversationId = data.conversation_id;
            showTypingIndicator(false);
            const botMsg = { role:'assistant', content:data.response, created_at: new Date().toISOString() };
            messages.push(botMsg);
            renderMessages();
            scrollToBottom();

            if (voiceEnabled) speakText(data.response, data.language);
            loadConversations();
        } catch (error) {
            showTypingIndicator(false);
            const errMsg = { role:'assistant', content:'⚠️ Something went wrong. Please try again.', created_at: new Date().toISOString() };
            messages.push(errMsg);
            renderMessages();
            scrollToBottom();
        }
        isProcessing = false;
        updateSendButton();
    }

    async function loadConversations() {
        try {
            const data = await apiCall('/api/conversations');
            conversations = data.conversations || [];
            renderConversationsList();
        } catch(e) {}
    }

    async function loadConversationMessages(convId) {
        try {
            const data = await apiCall(`/api/conversations/${convId}/messages`);
            messages = data.messages || [];
            currentConversationId = convId;
            renderMessages();
            scrollToBottom();
            showWelcomeScreen(messages.length === 0);
            renderConversationsList();
            closeSidebar();
        } catch(e) {}
    }

    async function deleteConversation(convId, e) {
        e.stopPropagation();
        if (!confirm('Delete this conversation?')) return;
        try {
            await apiCall(`/api/conversations/${convId}`, 'DELETE');
            if (currentConversationId === convId) {
                currentConversationId = null;
                messages = [];
                renderMessages();
                showWelcomeScreen(true);
            }
            await loadConversations();
        } catch(e) {}
    }

    function renderMessages() {
        messagesContainer.innerHTML = '';
        if (messages.length === 0) {
            const ws = document.getElementById('welcomeScreen');
            if (ws) messagesContainer.appendChild(ws);
            showWelcomeScreen(true);
            return;
        }
        showWelcomeScreen(false);
        messages.forEach(msg => {
            const row = document.createElement('div');
            row.className = `message-row ${msg.role}`;
            const avatar = document.createElement('div');
            avatar.className = `msg-avatar ${msg.role==='assistant'?'bot-avatar':'user-avatar'}`;
            avatar.textContent = msg.role==='assistant'?'🤖':'👤';
            const bubbleWrap = document.createElement('div');
            const bubble = document.createElement('div');
            bubble.className = 'msg-bubble';
            bubble.innerHTML = escapeHTML(msg.content).replace(/\n/g, '<br>');
            const time = document.createElement('div');
            time.className = 'msg-time';
            time.textContent = formatTime(msg.created_at);
            bubbleWrap.appendChild(bubble);
            bubbleWrap.appendChild(time);
            if (msg.role==='assistant') { row.appendChild(avatar); row.appendChild(bubbleWrap); }
            else { row.appendChild(bubbleWrap); row.appendChild(avatar); }
            messagesContainer.appendChild(row);
        });
    }

    function renderConversationsList() {
        conversationsList.innerHTML = '';
        if (conversations.length===0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'padding:20px;text-align:center;color:var(--text-muted);font-size:0.8rem;';
            empty.textContent = 'No conversations yet';
            conversationsList.appendChild(empty);
            return;
        }
        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = `conv-item ${conv.id===currentConversationId?'active':''}`;
            item.textContent = conv.title || 'Untitled';
            item.addEventListener('click', ()=> loadConversationMessages(conv.id));
            const del = document.createElement('button');
            del.className = 'delete-conv'; del.textContent = '🗑';
            del.addEventListener('click', (e)=> deleteConversation(conv.id, e));
            item.appendChild(del);
            conversationsList.appendChild(item);
        });
    }

    function showWelcomeScreen(show) {
        const ws = document.getElementById('welcomeScreen');
        if (show) {
            if (!ws) {
                const newWS = document.createElement('div');
                newWS.className = 'welcome-screen';
                newWS.id = 'welcomeScreen';
                newWS.innerHTML = `
                    <div class="welcome-avatar">🤖</div>
                    <div class="welcome-title">Welcome to Sami AI!</div>
                    <div class="welcome-subtitle">English, Bangla, or Banglish – I speak your language.</div>
                    <div class="welcome-suggestions">
                        <div class="suggestion-chip" data-msg="Who are you?">👋 Who are you?</div>
                        <div class="suggestion-chip" data-msg="What can you do?">💡 What can you do?</div>
                        <div class="suggestion-chip" data-msg="Tell me about DIU">🎓 DIU</div>
                        <div class="suggestion-chip" data-msg="Software engineering ki?">💻 SWE</div>
                    </div>
                `;
                messagesContainer.appendChild(newWS);
                attachSuggestionListeners();
            } else {
                ws.style.display = 'flex';
            }
            messagesContainer.style.justifyContent = 'center';
        } else {
            if (ws) ws.style.display = 'none';
            messagesContainer.style.justifyContent = 'flex-start';
        }
    }

    function attachSuggestionListeners() {
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', ()=>{
                const msg = chip.getAttribute('data-msg');
                if (msg) { userInput.value = msg; sendMessage(msg); }
            });
        });
    }

    function showTypingIndicator(show) {
        const existing = document.getElementById('typingIndicator');
        if (show) {
            if (!existing) {
                const ind = document.createElement('div');
                ind.id = 'typingIndicator';
                ind.className = 'message-row bot';
                ind.innerHTML = `
                    <div class="msg-avatar bot-avatar">🤖</div>
                    <div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div></div>
                `;
                messagesContainer.appendChild(ind);
                scrollToBottom();
            }
        } else { if (existing) existing.remove(); }
    }

    function scrollToBottom() { setTimeout(()=> messagesContainer.scrollTop = messagesContainer.scrollHeight, 50); }
    function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
    function formatTime(iso) { if (!iso) return ''; return new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
    function autoResizeTextarea() { userInput.style.height='auto'; userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px'; }
    function updateSendButton() { sendBtn.disabled = !userInput.value.trim() || isProcessing; }

    function setupSpeechRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { micBtn.style.display='none'; return; }
        recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
            let transcript = '';
            for (let i=e.resultIndex; i<e.results.length; i++) transcript += e.results[i][0].transcript;
            userInput.value = transcript;
            autoResizeTextarea();
            updateSendButton();
            if (e.results[0]?.isFinal) { stopListening(); if (transcript.trim()) sendMessage(transcript.trim()); }
        };
        recognition.onerror = () => stopListening();
        recognition.onend = () => stopListening();
    }

    function setupSpeechSynthesis() { if (!synth) voiceToggleBtn.style.display='none'; }

    function startListening() {
        if (!recognition || isListening) return;
        recognition.lang = 'bn-BD';   // default to Bangla (will handle English as well)
        try { recognition.start(); isListening=true; micBtn.classList.add('listening'); micBtn.textContent='🔴'; } catch(e){}
    }

    function stopListening() {
        if (!recognition) return;
        try { recognition.stop(); } catch(e){}
        isListening=false; micBtn.classList.remove('listening'); micBtn.textContent='🎤';
    }

    function speakText(text, lang) {
        if (!synth || !voiceEnabled) return;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        utterance.rate = 0.9;
        const voices = synth.getVoices();
        if (voices.length) {
            utterance.voice = voices.find(v => v.lang.startsWith(utterance.lang)) || voices[0];
        }
        synth.speak(utterance);
    }

    function toggleVoice() {
        voiceEnabled = !voiceEnabled;
        voiceToggleBtn.classList.toggle('active', voiceEnabled);
        voiceToggleBtn.textContent = voiceEnabled ? '🔊 Voice On' : '🔊 Voice Off';
    }

    function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('show'); }
    function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('show'); }

    menuToggle.addEventListener('click', ()=> sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
    sidebarOverlay.addEventListener('click', closeSidebar);
    newChatBtn.addEventListener('click', ()=>{ currentConversationId=null; messages=[]; renderMessages(); showWelcomeScreen(true); closeSidebar(); userInput.focus(); });
    sendBtn.addEventListener('click', ()=>{ if (userInput.value.trim()) sendMessage(userInput.value.trim()); });
    userInput.addEventListener('input', ()=>{ autoResizeTextarea(); updateSendButton(); });
    userInput.addEventListener('keydown', (e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendBtn.click(); } });
    micBtn.addEventListener('click', ()=> isListening ? stopListening() : startListening());
    voiceToggleBtn.addEventListener('click', toggleVoice);
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeSidebar(); });
    init();
    userInput.focus();
})();
