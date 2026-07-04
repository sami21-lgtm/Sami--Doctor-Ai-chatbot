# app.py – Multilingual Chatbot (English/Bangla/Banglish), Database, 18+ Filter
from flask import Flask, request, jsonify, send_from_directory
import sqlite3, os, re, random
from datetime import datetime

app = Flask(__name__, static_folder='static', static_url_path='')
DATABASE = 'sami_ai.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY, title TEXT, created_at TEXT)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT, role TEXT, content TEXT, language TEXT, created_at TEXT,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE)''')
    conn.commit()
    conn.close()

def generate_id():
    return datetime.now().strftime('%Y%m%d%H%M%S%f') + str(random.randint(1000,9999))

# 18+ filter
BANNED = ['sex','porn','nude','xxx','fuck','shit','bastard','haram','অশ্লীল','পর্ণ','নগ্ন','যৌন','ধর্ষণ']
def is_adult(text):
    t = text.lower()
    return any(word in t for word in BANNED)

# Language detection
def detect_language(text):
    bn_chars = len(re.findall(r'[\u0980-\u09FF]', text))
    en_chars = len(re.findall(r'[a-zA-Z]', text))
    total = bn_chars + en_chars
    if total == 0: return 'en'
    bn_ratio = bn_chars / total
    if bn_ratio > 0.7:
        return 'bn'
    elif bn_ratio < 0.3:
        return 'en'
    else:
        return 'mixed'

# Smart response generator – separates Bangla, English, Mixed
def reply_in_english(msg):
    msg_lower = msg.strip().lower()
    if 'who are you' in msg_lower or 'who r u' in msg_lower:
        return ("I am Sami AI, your multilingual chatbot.\n"
                "Developed by Md Emtiaz Hossain Sami,\n"
                "Dept. of Software Engineering, Daffodil International University.")
    if 'developer' in msg_lower or 'who made you' in msg_lower:
        return "I was created by Md Emtiaz Hossain Sami."
    if 'daffodil' in msg_lower or 'diu' in msg_lower:
        return "Daffodil International University is one of the top private universities in Bangladesh."
    if 'software' in msg_lower or 'swe' in msg_lower:
        return "Software Engineering is the systematic application of engineering approaches to software development."
    if 'weather' in msg_lower:
        return "I can't fetch real-time weather data yet, but I can help with other things."
    if 'joke' in msg_lower:
        jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why did the developer go broke? Because he used up all his cache!",
            "I told my computer I needed a break, now it won't stop sending me vacation ads."
        ]
        return random.choice(jokes)
    if 'what can you do' in msg_lower:
        return ("I can chat in English, Bangla, and Banglish.\n"
                "- General knowledge, tech help, jokes, advice.\n"
                "- Just ask anything (except 18+).")
    if 'thank' in msg_lower:
        return "You're welcome! Feel free to ask more."
    default = ["That's interesting! Let me think about it.",
               "Great question! Here's what I know:",
               "I love this topic! Let me share some thoughts."]
    return random.choice(default)

def reply_in_bangla(msg):
    msg_lower = msg.strip()
    if 'তুমি কে' in msg_lower or 'আপনি কে' in msg_lower:
        return ("আমি সামি এআই, একটি মাল্টিলিঙ্গুয়াল চ্যাটবট।\n"
                "আমাকে তৈরি করেছেন মোঃ এমতিয়াজ হোসেন সামি,\n"
                "সফটওয়্যার ইঞ্জিনিয়ারিং বিভাগ, ড্যাফোডিল ইন্টারন্যাশনাল ইউনিভার্সিটি।")
    if 'কে বানিয়েছে' in msg_lower or 'তোমার নির্মাতা' in msg_lower:
        return "আমাকে বানিয়েছেন মোঃ এমতিয়াজ হোসেন সামি।"
    if 'ড্যাফোডিল' in msg_lower or 'diu' in msg_lower:
        return "ড্যাফোডিল ইন্টারন্যাশনাল ইউনিভার্সিটি বাংলাদেশের একটি শীর্ষস্থানীয় বেসরকারি বিশ্ববিদ্যালয়।"
    if 'সফটওয়্যার' in msg_lower or 'software' in msg_lower:
        return "সফটওয়্যার ইঞ্জিনিয়ারিং হলো সিস্টেমেটিক পদ্ধতিতে সফটওয়্যার তৈরির প্রক্রিয়া।"
    if 'আবহাওয়া' in msg_lower:
        return "আমি এখনো রিয়েল-টাইম আবহাওয়ার তথ্য দিতে পারি না, তবে অন্য কিছু জিজ্ঞেস করতে পারেন।"
    if 'কৌতুক' in msg_lower or 'জোক' in msg_lower:
        jokes = ["কম্পিউটার কেন ঠান্ডা থাকে? কারণ তার অনেক ফ্যান আছে!",
                 "প্রোগ্রামারদের প্রিয় জায়গা কোথায়? - 'ক্লাউড' এ!"]
        return random.choice(jokes)
    if 'কী করতে পারো' in msg_lower:
        return ("আমি বাংলা, ইংরেজি ও বাংলিশে কথা বলতে পারি।\n"
                "- সাধারণ জ্ঞান, প্রযুক্তি, কৌতুক, পরামর্শ দিতে পারি।")
    if 'ধন্যবাদ' in msg_lower:
        return "আপনাকে স্বাগতম! আবার আসবেন।"
    default = ["এটি একটি চমৎকার প্রশ্ন। আমি উত্তর দেওয়ার চেষ্টা করছি।",
               "আপনার প্রশ্নটি খুবই আগ্রহজনক। চলুন দেখি।",
               "বাহ! দারুণ প্রশ্ন। আমি যতটুকু জানি শেয়ার করছি।"]
    return random.choice(default)

def reply_mixed(msg):
    msg_lower = msg.strip().lower()
    if 'who are you' in msg_lower or 'তুমি কে' in msg_lower:
        return ("I am Sami AI, বাংলা ও ইংরেজি দুই ভাষাতেই কথা বলতে পারি।\n"
                "Developed by Md Emtiaz Hossain Sami, SWE, DIU.")
    if 'ড্যাফোডিল' in msg_lower or 'daffodil' in msg_lower:
        return "Daffodil International University (DIU) is a top private university in Bangladesh."
    if 'software' in msg_lower or 'সফটওয়্যার' in msg_lower:
        return "Software Engineering means systematic software development. এটা প্রোগ্রামিং, ডাটাবেজ, টেস্টিং-এর সমন্বয়।"
    if 'joke' in msg_lower or 'কৌতুক' in msg_lower:
        jokes = ["Why do programmers prefer dark mode? Because light attracts bugs! 😄",
                 "কম্পিউটার কেন ঠান্ডা থাকে? কারণ তার অনেক ফ্যান আছে।"]
        return random.choice(jokes)
    if 'what can you do' in msg_lower or 'কী করতে পারো' in msg_lower:
        return "I can help with both English & Bangla queries, tech support, jokes, and more!"
    defaults = ["Interesting! Let me answer that in a mix.",
                "Got it! I'll reply accordingly.",
                "That's a fun question. Here's my mixed response."]
    return random.choice(defaults)

# Main API
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message required'}), 400
    user_msg = data['message']
    conv_id = data.get('conversation_id')

    # Adult content filter
    if is_adult(user_msg):
        return jsonify({
            'response': '⚠️ Sorry, 18+ content is not allowed.',
            'conversation_id': conv_id,
            'language': 'en'
        })

    lang = detect_language(user_msg)

    # Generate response based on detected language
    if lang == 'en':
        bot_resp = reply_in_english(user_msg)
    elif lang == 'bn':
        bot_resp = reply_in_bangla(user_msg)
    else:
        bot_resp = reply_mixed(user_msg)

    conn = get_db()
    if not conv_id:
        conv_id = generate_id()
        title = user_msg[:40] + ('...' if len(user_msg)>40 else '')
        conn.execute('INSERT INTO conversations (id, title, created_at) VALUES (?,?,?)',
                     (conv_id, title, datetime.now().isoformat()))
    else:
        exists = conn.execute('SELECT id FROM conversations WHERE id=?', (conv_id,)).fetchone()
        if not exists:
            conv_id = generate_id()
            title = user_msg[:40] + '...'
            conn.execute('INSERT INTO conversations (id, title, created_at) VALUES (?,?,?)',
                         (conv_id, title, datetime.now().isoformat()))

    now = datetime.now().isoformat()
    conn.execute('INSERT INTO messages (conversation_id, role, content, language, created_at) VALUES (?,?,?,?,?)',
                 (conv_id, 'user', user_msg, lang, now))
    conn.execute('INSERT INTO messages (conversation_id, role, content, language, created_at) VALUES (?,?,?,?,?)',
                 (conv_id, 'assistant', bot_resp, lang, now))
    conn.commit()
    conn.close()

    return jsonify({
        'response': bot_resp,
        'conversation_id': conv_id,
        'language': lang
    })

@app.route('/api/conversations', methods=['GET'])
def get_convs():
    conn = get_db()
    rows = conn.execute('SELECT id, title, created_at FROM conversations ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify({'conversations': [{'id':r['id'],'title':r['title'],'created_at':r['created_at']} for r in rows]})

@app.route('/api/conversations/<conv_id>/messages', methods=['GET'])
def get_msgs(conv_id):
    conn = get_db()
    rows = conn.execute('SELECT role, content, language, created_at FROM messages WHERE conversation_id=? ORDER BY created_at', (conv_id,)).fetchall()
    conn.close()
    return jsonify({'messages': [{'role':r['role'],'content':r['content'],'language':r['language'],'created_at':r['created_at']} for r in rows]})

@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def del_conv(conv_id):
    conn = get_db()
    conn.execute('DELETE FROM messages WHERE conversation_id=?', (conv_id,))
    conn.execute('DELETE FROM conversations WHERE id=?', (conv_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
