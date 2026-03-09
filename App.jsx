import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are QA-Agent, an expert AI testing assistant for mobile and web apps.

Your job:
1. When given a URL or app description, generate a structured test plan
2. Analyze test results and report bugs clearly
3. Suggest fixes for issues found
4. Generate test cases in simple language

When the user gives you a URL or app to test, respond with:
- A JSON block wrapped in <TEST_PLAN>...</TEST_PLAN> tags with this structure:
{
  "summary": "one-line app description",
  "categories": [
    {
      "name": "Category Name",
      "icon": "emoji",
      "tests": [
        { "id": "T001", "name": "Test name", "steps": ["step 1", "step 2"], "expected": "expected result", "priority": "high|medium|low" }
      ]
    }
  ]
}

When the user reports a bug or asks for analysis, respond conversationally with clear:
- Bug severity (Critical/High/Medium/Low)
- Root cause hypothesis  
- Steps to reproduce
- Suggested fix

Keep responses practical, concise, and actionable. Always be helpful and direct.`;

const WELCOME = {
  role: "assistant",
  content: `👋 **Welcome to QA-Agent!**

I'm your AI-powered testing assistant for **web and mobile apps**. I can help you:

- 🧪 **Generate test plans** — just give me a URL or describe your app
- 🐛 **Analyze bugs** — describe what broke and I'll help debug
- ✅ **Create test cases** — for any feature or user flow
- 📱 **Mobile testing** — iOS, Android, React Native, Flutter
- 🌐 **Web testing** — UI, API, performance, accessibility

**To get started, try:**
- \`test https://yourapp.com\`
- \`generate tests for a login page\`
- \`I found a bug: the submit button doesn't work on mobile\``,
};

const parseTestPlan = (text) => {
  const match = text.match(/<TEST_PLAN>([\s\S]*?)<\/TEST_PLAN>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

const priorityColor = { high: "#ff4d4d", medium: "#ffa500", low: "#4caf50" };
const priorityBg = { high: "#2a1010", medium: "#2a1800", low: "#0a2010" };

export default function QAAgent() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testPlan, setTestPlan] = useState(null);
  const [checkedTests, setCheckedTests] = useState({});
  const [activeTab, setActiveTab] = useState("chat");
  const [expandedCat, setExpandedCat] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Read API key from environment variable
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleTest = (id) =>
    setCheckedTests((prev) => ({ ...prev, [id]: !prev[id] }));

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    if (!apiKey) {
      alert("Missing API key! Add VITE_ANTHROPIC_API_KEY to your .env file.");
      return;
    }

    const userMsg = { role: "user", content: text };
    const newMessages = [
      ...messages.filter((m) => m !== WELCOME || messages.length > 1),
      userMsg,
    ];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply =
        data.content?.map((c) => c.text || "").join("") ||
        "Sorry, I couldn't respond.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMsg]);

      const plan = parseTestPlan(reply);
      if (plan) {
        setTestPlan(plan);
        setCheckedTests({});
        setExpandedCat(plan.categories?.[0]?.name || null);
        setActiveTab("tests");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Connection error. Check your API key and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickActions = [
    {
      label: "🔐 Login Flow",
      cmd: "Generate test cases for a login and authentication flow",
    },
    {
      label: "🛒 Checkout",
      cmd: "Generate tests for an e-commerce checkout process",
    },
    {
      label: "📱 Mobile UI",
      cmd: "Generate mobile UI tests for tap targets, gestures, and responsiveness",
    },
    {
      label: "♿ Accessibility",
      cmd: "Generate accessibility test cases for a web app",
    },
  ];

  const completedCount = Object.values(checkedTests).filter(Boolean).length;
  const totalTests =
    testPlan?.categories?.reduce((s, c) => s + c.tests.length, 0) || 0;

  const renderMarkdown = (text) => {
    const cleanText = text.replace(
      /<TEST_PLAN>[\s\S]*?<\/TEST_PLAN>/g,
      "✅ *Test plan generated — see the Tests tab!*"
    );
    return cleanText
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        "<code style='background:#1a2a1a;padding:1px 5px;border-radius:3px;font-size:0.85em;color:#7fff7f'>$1</code>"
      )
      .replace(/\n/g, "<br/>");
  };

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        background: "#080e08",
        color: "#c8ffc8",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderBottom: "1px solid #1a3a1a",
          background: "#060c06",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #00ff41, #007a20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: "bold",
              color: "#000",
            }}
          >
            Q
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#00ff41",
                letterSpacing: 2,
              }}
            >
              QA-AGENT
            </div>
            <div style={{ fontSize: 10, color: "#3a6a3a", letterSpacing: 1 }}>
              AI TESTING ASSISTANT
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["chat", "tests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#00ff41" : "transparent",
                color: activeTab === tab ? "#000" : "#3a8a3a",
                border:
                  "1px solid " +
                  (activeTab === tab ? "#00ff41" : "#1a4a1a"),
                borderRadius: 4,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "inherit",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: activeTab === tab ? "bold" : "normal",
              }}
            >
              {tab === "tests" && testPlan
                ? `${tab} (${completedCount}/${totalTests})`
                : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    background:
                      msg.role === "user" ? "#0a2a0a" : "#0c160c",
                    border:
                      "1px solid " +
                      (msg.role === "user" ? "#1a5a1a" : "#1a3a1a"),
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: msg.role === "user" ? "#aaffaa" : "#c8ffc8",
                  }}
                >
                  {msg.role === "assistant" ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#3a8a3a",
                  fontSize: 12,
                }}
              >
                <span style={{ animation: "blink 1s infinite" }}>▋</span>{" "}
                Analyzing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions */}
          <div
            style={{
              padding: "8px 18px",
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              borderTop: "1px solid #0e1e0e",
            }}
          >
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.cmd)}
                style={{
                  background: "#0a1a0a",
                  border: "1px solid #1a3a1a",
                  color: "#5aaa5a",
                  borderRadius: 4,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 18px",
              borderTop: "1px solid #1a3a1a",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage(input)
              }
              placeholder="Describe your app or paste a URL to test..."
              style={{
                flex: 1,
                background: "#0a160a",
                border: "1px solid #1a4a1a",
                color: "#c8ffc8",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim() ? "#0a1a0a" : "#00ff41",
                color: loading || !input.trim() ? "#2a4a2a" : "#000",
                border: "none",
                borderRadius: 6,
                padding: "0 18px",
                cursor:
                  loading || !input.trim() ? "default" : "pointer",
                fontSize: 13,
                fontWeight: "bold",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              RUN
            </button>
          </div>
        </>
      )}

      {/* Tests Tab */}
      {activeTab === "tests" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {!testPlan ? (
            <div
              style={{
                textAlign: "center",
                color: "#2a5a2a",
                marginTop: 60,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
              <div style={{ fontSize: 14 }}>No test plan yet.</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                Go to Chat and ask me to generate tests for your app.
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 14px",
                  background: "#0a160a",
                  borderRadius: 8,
                  border: "1px solid #1a3a1a",
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#5aaa5a", marginBottom: 4 }}
                >
                  📋 {testPlan.summary}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "#0e1e0e",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${
                          totalTests
                            ? (completedCount / totalTests) * 100
                            : 0
                        }%`,
                        height: "100%",
                        background: "#00ff41",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#3a7a3a" }}>
                    {completedCount}/{totalTests} done
                  </span>
                </div>
              </div>

              {testPlan.categories?.map((cat) => (
                <div
                  key={cat.name}
                  style={{
                    marginBottom: 10,
                    border: "1px solid #1a3a1a",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() =>
                      setExpandedCat(
                        expandedCat === cat.name ? null : cat.name
                      )
                    }
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      background:
                        expandedCat === cat.name ? "#0c1c0c" : "#080e08",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: "bold",
                        color: "#7fff7f",
                      }}
                    >
                      {cat.icon} {cat.name}
                    </span>
                    <span style={{ fontSize: 11, color: "#3a6a3a" }}>
                      {cat.tests.filter((t) => checkedTests[t.id]).length}/
                      {cat.tests.length} ▾
                    </span>
                  </div>
                  {expandedCat === cat.name &&
                    cat.tests.map((test) => (
                      <div
                        key={test.id}
                        style={{
                          padding: "10px 14px",
                          borderTop: "1px solid #0e1e0e",
                          background: checkedTests[test.id]
                            ? "#060e06"
                            : "#080e08",
                          opacity: checkedTests[test.id] ? 0.5 : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedTests[test.id]}
                            onChange={() => toggleTest(test.id)}
                            style={{
                              marginTop: 2,
                              accentColor: "#00ff41",
                              cursor: "pointer",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{ fontSize: 10, color: "#2a5a2a" }}
                              >
                                {test.id}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: "bold",
                                  color: checkedTests[test.id]
                                    ? "#2a5a2a"
                                    : "#aaffaa",
                                  textDecoration: checkedTests[test.id]
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {test.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 9,
                                  padding: "1px 6px",
                                  borderRadius: 3,
                                  color: priorityColor[test.priority],
                                  background: priorityBg[test.priority],
                                  border: `1px solid ${
                                    priorityColor[test.priority]
                                  }40`,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                }}
                              >
                                {test.priority}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#3a7a3a",
                                marginBottom: 4,
                              }}
                            >
                              {test.steps?.map((s, si) => (
                                <div key={si}>→ {s}</div>
                              ))}
                            </div>
                            <div
                              style={{ fontSize: 11, color: "#2a6a2a" }}
                            >
                              ✓ Expected: {test.expected}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}

              <button
                onClick={() => {
                  setActiveTab("chat");
                  sendMessage(
                    "I found some failures in the tests. Help me analyze and prioritize the bugs."
                  );
                }}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "10px",
                  background: "#0a1a0a",
                  border: "1px solid #1a4a1a",
                  color: "#5aaa5a",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              >
                🐛 Report Failures & Get Bug Analysis →
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060c06; }
        ::-webkit-scrollbar-thumb { background: #1a4a1a; border-radius: 2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        input::placeholder { color: #2a5a2a; }
      `}</style>
    </div>
  );
}
