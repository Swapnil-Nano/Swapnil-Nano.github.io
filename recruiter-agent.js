/*
  Change this to the URL of your deployed backend.
  Example: https://swapnil-recruiter-ai.vercel.app/api/chat
*/
const CAREER_AI_API_URL = "https://swapnil-recruiter-ai-starter.vercel.app/api/chat";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("careerAiForm");
  const input = document.getElementById("careerAiInput");
  const sendButton = document.getElementById("careerAiSend");
  const resetButton = document.getElementById("careerAiReset");
  const messages = document.getElementById("careerAiMessages");
  const quickButtons = document.querySelectorAll("[data-question]");

  if (!form || !input || !messages) return;

  let previousResponseId = sessionStorage.getItem("careerAiPreviousResponseId");

  function addMessage(text, type) {
    const node = document.createElement("div");
    node.className = `career-ai__message career-ai__message--${type}`;
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  }

  function setLoading(isLoading) {
    sendButton.disabled = isLoading;
    resetButton.disabled = isLoading;
    input.disabled = isLoading;
    sendButton.textContent = isLoading ? "Thinking..." : "Ask assistant";
  }

  async function ask(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    addMessage(cleanQuestion, "user");
    input.value = "";
    setLoading(true);

    const status = addMessage(
      "Searching the verified career knowledge base...",
      "status"
    );

    try {
      const response = await fetch(CAREER_AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: cleanQuestion,
          previousResponseId,
        }),
      });

      const data = await response.json();

      status.remove();

      if (!response.ok) {
        throw new Error(data.error || "The assistant could not answer.");
      }

      addMessage(data.answer, "assistant");

      if (data.responseId) {
        previousResponseId = data.responseId;
        sessionStorage.setItem(
          "careerAiPreviousResponseId",
          previousResponseId
        );
      }
    } catch (error) {
      if (status.isConnected) status.remove();
      addMessage(
        error.message ||
          "The career assistant is temporarily unavailable. Please try again.",
        "assistant"
      );
    } finally {
      setLoading(false);
      input.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      ask(button.dataset.question || "");
    });
  });

  resetButton.addEventListener("click", () => {
    previousResponseId = null;
    sessionStorage.removeItem("careerAiPreviousResponseId");
    messages.innerHTML = "";
    addMessage(
      "New conversation started. Ask about Swapnil's experience, skills, accomplishments, publications, or fit for a role.",
      "assistant"
    );
    input.focus();
  });
});
