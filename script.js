/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// This array keeps track of the whole conversation history.
// It helps the AI remember what was said before, so it can respond naturally.
const messages = [
  {
    role: "system",
    content:
      "You are a friendly and helpful beauty assistant created by L'Oréal. You only answer questions about skincare, haircare, and makeup. Recommend only L'Oréal products. If a user asks something unrelated, kindly redirect them to beauty-related topics. If the user provides their name, remember it and use it in future responses.",
  },
];

// Variable to store the user's name if they provide it
let userName = "";

// Show initial welcome message as an assistant bubble
chatWindow.innerHTML = `<p class="msg ai"><strong>Bot:</strong> 👋 Hello! I'm your L'Oréal beauty assistant. Ask me anything about haircare, skincare, or makeup!</p>`;

// Track if it's the first user question
let isFirstQuestion = true;

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value;
  if (!question.trim()) return;

  // Add user's question to conversation history
  messages.push({
    role: "user",
    content: question,
  });

  // If it's the first question, clear the welcome message
  if (isFirstQuestion) {
    chatWindow.innerHTML = "";
    isFirstQuestion = false;
  } else {
    // Otherwise, clear previous messages and show only the latest user question
    chatWindow.innerHTML = "";
  }

  // Clear chat window for new exchange
  chatWindow.innerHTML = "";

  // Show user's message as a bubble
  chatWindow.innerHTML += `<p class="msg user"><strong>You:</strong> ${question}</p>`;

  // Clear input immediately after submit
  userInput.value = "";

  // Show loading message as an assistant bubble
  chatWindow.innerHTML += `<p class="msg ai"><em>Thinking...</em></p>`;

  // Send request to your Cloudflare Worker (no API key needed in JS)
  const response = await fetch(
    "https://loreal-worker.tankadin1988.workers.dev/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use gpt-4o for best results
        messages: messages,
        temperature: 0.7,
      }),
    }
  );

  const data = await response.json();
  const reply = data.choices[0].message.content;

  // Check if the AI learned the user's name from the reply
  // (Simple check: look for "Nice to meet you" and extract name from last user message)
  if (!userName && /my name is (\w+)/i.test(question)) {
    userName = question.match(/my name is (\w+)/i)[1];
  }

  // Add assistant's reply to conversation history
  messages.push({
    role: "assistant",
    content: reply,
  });

  // Convert line breaks to <br> for better readability in chat
  const formattedReply = reply.replace(/\n/g, "<br>");

  // Replace chat window with user and assistant bubbles
  chatWindow.innerHTML = `
    <p class="msg user"><strong>You:</strong> ${question}</p>
    <div style="height:16px"></div>
    <p class="msg ai"><strong>Bot:</strong> ${formattedReply}</p>
  `;
});
