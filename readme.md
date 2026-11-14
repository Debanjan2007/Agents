
# 🤖 Agents

A small collection of **terminal-based AI agents** built while exploring agentic AI, tool calling, and conversational workflows in JavaScript.

The idea is simple: bring your own API keys, run an agent from your terminal, and experiment with what an LLM can do when it has access to tools.

> **Status:** Learning project / experimental. Currently includes a weather-and-email agent; more experiments may be added over time.

## ✨ What's inside?

### 🌦️ Weather & Email Agent

**File:** [`Weather-email.agent.js`](./Weather-email.agent.js)

A conversational agent that can:

- Chat with you through a terminal interface.
- Look up current weather for a location using [`wttr.in`](https://wttr.in/).
- Send an email using [Resend](https://resend.com/) when requested.
- Keep conversation history in memory for the current session.
- Exit on `exit` or after the terminal input times out.

The agent is built with the [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/), but its model client is configured to use a Gemini-compatible API endpoint.

## 🛠️ Tech stack

| Technology | Purpose |
| --- | --- |
| Node.js (ES modules) | Runtime and terminal interface |
| `@openai/agents` | Agent orchestration and tool calling |
| `openai` | API client for the configured Gemini endpoint |
| `zod` | Tool input/output schemas |
| `resend` | Email delivery |
| `dotenv` | Environment configuration |
| `wttr.in` | Weather data |

## 🚀 Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Debanjan2007/Agents.git
cd Agents
```

### 2. Install dependencies

Use a recent Node.js version with built-in `fetch` support (Node.js 20+ recommended).

```bash
npm install
```

### 3. Configure your environment

Create a `.env` file in the repository root:

```dotenv
GEMINI_BASE_URL=YOUR_GEMINI_OPENAI_COMPATIBLE_BASE_URL
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
RESEND_API_KEY=YOUR_RESEND_API_KEY
SENDER_EMAIL=YOUR_VERIFIED_SENDER_EMAIL
```

- `GEMINI_BASE_URL`: An OpenAI-compatible API base URL for your Gemini provider.
- `GEMINI_API_KEY`: Your model API key.
- `RESEND_API_KEY`: Your Resend API key, required for sending email.
- `SENDER_EMAIL`: A sender address authorized in your Resend account.

**Never commit your `.env` file or API keys.**

### 4. Run the agent

```bash
node Weather-email.agent.js
```

### 5. Try a few prompts

```text
> Hey, how's it going?
> What's the weather like in Kolkata?
> Email the weather report to me@example.com
> exit
```

Email delivery requires a valid Resend configuration. The terminal prompt currently has a **20-second input timeout**, so it may end the session if you do not type anything in time.

## 🧠 How it works

```text
User (terminal)
      |
      v
Node.js readline interface
      |
      v
OpenAI Agents SDK
      |
      v
Gemini model via compatible API
      |
      +---- Weather tool ----> wttr.in
      |
      +---- Email tool ------> Resend
      |
      v
Agent response in terminal
```

The agent receives the conversation history, decides whether to answer directly or call an available tool, and returns its response. The history is held **in process memory**, so it does not persist between application restarts.

## 📁 Repository structure

```text
Agents/
├── Weather-email.agent.js   # Terminal agent and its tools
├── package.json             # Project metadata and dependencies
├── package-lock.json        # Dependency lockfile
├── .gitignore
└── README.md
```

## ⚠️ Current limitations

This is an experiment, not a production-ready agent system.

- The model name is currently hardcoded in the JavaScript file. Your configured provider must support that model identifier, or you must change it.
- Conversation history is kept only in memory and is not automatically trimmed or summarized.
- The email tool has no explicit user-confirmation step before sending. **Review the recipient and message before requesting an email.**
- The email tool declares a structured result schema but does not currently return a matching success/failure object. This should be fixed for reliable tool execution.
- Error handling and provider compatibility need further testing.
- No automated tests are configured yet.

## 🔭 Possible next steps

- Add more agents and tools.
- Add human-in-the-loop approval for external actions such as sending emails.
- Introduce configurable model selection and bring-your-own-key support across providers.
- Improve error handling and tool result validation.
- Add conversation-history limits or summarization.
- Add automated tests and examples.

## 🤝 Contributing

This repository is mainly for learning and experimentation. If you spot a bug or have an idea for another agent, feel free to open an issue or pull request.

## 👨‍💻 Author

**Debanjan Das** — [GitHub](https://github.com/Debanjan2007)

---

If this repo helps you learn something about agents or tool calling, consider giving it a ⭐.
