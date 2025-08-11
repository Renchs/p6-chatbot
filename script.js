const chatMessages = [];
const chatContainer = document.getElementById("chat_mensagem");

const api = "http://localhost:3000/chat";

const saveMessage = (message) => {
  localStorage.setItem("chatHistory", JSON.stringify(message));
};

const captureDate = () => {
  const date = new Date();
  const hours = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return hours;
};

const hours = document.querySelector(".yours-chat");


if (!hours.textContent || hours.textContent.trim() === "") {
  const now = captureDate();
  hours.textContent = now;
  hours.setAttribute("datetime", new Date().toISOString());
}

function lightDark() {
  const element = document.body;
  element.classList == "light-mode"
    ? element.classList.replace("light-mode", "dark-mode")
    : element.classList.replace("dark-mode", "light-mode");
}

function createMessage(message, type, hours = "") {
  const messageType = type === "bot" ? "bot" : "user";

  const article = document.createElement("article");
  article.classList.add("mensagem", messageType);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  const time = document.createElement("time");

  const now = hours && hours !== "" ? hours : captureDate();

  time.textContent = now;
  time.classList.add("yours-chat");
  time.setAttribute("datetime", new Date().toISOString());

  bubble.appendChild(paragraph);
  bubble.appendChild(time);
  article.appendChild(bubble);

  const chatMessage = {
    text: message,
    type: messageType,
    time: now,
  };

  chatMessages.push(chatMessage);
  saveMessage(chatMessages);

  return article;
}

function initChat() {
  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    const chatHistory = JSON.parse(savedHistory);
    const chatContainer = document.getElementById("chat_mensagem");
    chatHistory.forEach((message) => {
      const messageElement = createMessage(
        message.text,
        message.type,
        message.time
      );
      chatContainer.appendChild(messageElement);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

const clearChat = () => {
  localStorage.removeItem("chatHistory");
  location.reload();

  hours.textContent = captureDate();
  hours.setAttribute("datetime", new Date().toISOString());
};

const apiRequest = async (message) => {
  fetchOption = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  };

  try {
    const response = await fetch(api, fetchOption);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("ocorreu um erro: ", error.message);
    return {
      answer: "Desculpe, ocorreu um erro ao processar sua solicitação.",
    };
  }
};

document.addEventListener("DOMContentLoaded", initChat);

document.getElementById("chat_form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userQuestion = document.getElementById("msgInput").value;

  if (userQuestion.trim() === "") {
    return;
  }

  const userMessage = createMessage(userQuestion, "user");
  chatContainer.appendChild(userMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  document.getElementById("msgInput").value = "";

  const botText = await apiRequest(userQuestion);

  const { message } = botText;

  const botResponse = createMessage(message, "bot");

  chatContainer.appendChild(botResponse);
  chatContainer.scrollTop = chatContainer.scrollHeight;

});
