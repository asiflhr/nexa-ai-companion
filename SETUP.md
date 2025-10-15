# AI Girlfriend App - Enhanced Setup Guide

## New Features Added

### 🔐 Authentication System
- MongoDB-based user authentication
- Sign up/Sign in functionality
- Session management with NextAuth

### 👤 User Profile System
- User preferences and settings
- Avatar support
- Personalized experience

### 🎭 AI Character Personas
- **Niko** - Friendly and empathetic companion (default)
- **Luna** - Mysterious and thoughtful night owl
- **Zara** - Energetic and adventurous spirit
- **Sage** - Wise and calming mentor

### 💬 Chat History System
- Save all conversations to MongoDB
- Load previous chats with context
- AI summarization for conversation continuity
- Chat management interface

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
TTS_API_KEY=your_tts_api_key_here
MONGODB_URI=mongodb://localhost:27017/ai-girlfriend
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- The app will automatically create the required collections

### 4. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Add this to your `NEXTAUTH_SECRET` in `.env`

### 5. Run the Application
```bash
npm run dev
```

## How It Works

### Authentication Flow
1. Users sign up/sign in with email and name
2. Sessions are managed with NextAuth JWT
3. All API routes are protected

### Chat System
1. Users can create multiple chats
2. Each chat has a selected persona
3. Messages are saved after each AI response
4. Chat history is summarized every 6 messages for context

### Persona System
1. Click on the AI name/avatar to change personas
2. Each persona has unique personality and response style
3. Persona affects how AI responds to messages

### Chat History
1. Click the message icon to view chat history
2. Select any previous chat to continue
3. AI receives conversation summary for context

## API Endpoints

- `POST /api/auth/[...nextauth]` - Authentication
- `GET/POST /api/chats` - Chat management
- `GET/PUT /api/chats/[id]` - Individual chat operations
- `POST /api/gemini` - AI responses (enhanced with persona/context)
- `POST /api/summarize` - Chat summarization

## Database Schema

### Users Collection
- email, name, avatar, selectedPersona, preferences

### Chats Collection
- userId, title, persona, messages[], summary, timestamps

## Usage Tips

1. **Switching Personas**: Click on the AI avatar/name in the header
2. **Chat History**: Click the message bubble icon in the header
3. **New Chat**: Use the "New Chat" button in chat history
4. **Logout**: Click the logout icon in the header

The app now provides a complete AI companion experience with persistent conversations, multiple personalities, and user management!