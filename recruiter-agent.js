/* ==================================================
   SWAPNIL NALAWADE
   FLOATING AI CAREER ASSISTANT
================================================== */


/*
  Secure Vercel backend.

  IMPORTANT:
  Never put the OpenAI API key in this file.
*/

const CAREER_AI_API_URL =
  "https://swapnil-recruiter-ai-starter.vercel.app/api/chat";



document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------
     ELEMENTS
  ---------------------------------------------- */

  const launcher =
    document.getElementById("aiChatLauncher");

  const chatWindow =
    document.getElementById("aiChatWindow");

  const closeButton =
    document.getElementById("aiChatClose");

  const form =
    document.getElementById("careerAiForm");

  const input =
    document.getElementById("careerAiInput");

  const sendButton =
    document.getElementById("careerAiSend");

  const resetButton =
    document.getElementById("careerAiReset");

  const messages =
    document.getElementById("careerAiMessages");

  const suggestionButtons =
    document.querySelectorAll(
      ".ai-chat-suggestions [data-question]"
    );


  if (
    !launcher ||
    !chatWindow ||
    !form ||
    !input ||
    !messages
  ) {

    console.error(
      "AI Career Assistant HTML elements were not found."
    );

    return;

  }



  /* ----------------------------------------------
     CONVERSATION MEMORY
  ---------------------------------------------- */

  let previousResponseId =
    sessionStorage.getItem(
      "careerAiPreviousResponseId"
    );



  /* ----------------------------------------------
     OPEN CHAT
  ---------------------------------------------- */

  function openChat() {

    chatWindow.classList.add("show");

    chatWindow.setAttribute(
      "aria-hidden",
      "false"
    );

    launcher.setAttribute(
      "aria-expanded",
      "true"
    );

    setTimeout(() => {

      input.focus();

    }, 150);

  }



  /* ----------------------------------------------
     CLOSE CHAT
  ---------------------------------------------- */

  function closeChat() {

    chatWindow.classList.remove("show");

    chatWindow.setAttribute(
      "aria-hidden",
      "true"
    );

    launcher.setAttribute(
      "aria-expanded",
      "false"
    );

  }



  /* ----------------------------------------------
     ADD MESSAGE
  ---------------------------------------------- */

  function addMessage(
    text,
    type
  ) {

    const message =
      document.createElement("div");


    message.className =
      `career-ai__message career-ai__message--${type}`;


    message.textContent =
      text;


    messages.appendChild(
      message
    );


    messages.scrollTop =
      messages.scrollHeight;


    return message;

  }



  /* ----------------------------------------------
     LOADING STATE
  ---------------------------------------------- */

  function setLoading(
    loading
  ) {

    sendButton.disabled =
      loading;

    resetButton.disabled =
      loading;

    input.disabled =
      loading;


    sendButton.textContent =
      loading
        ? "Thinking..."
        : "Send";

  }



  /* ----------------------------------------------
     ASK ASSISTANT
  ---------------------------------------------- */

  async function askAssistant(
    question
  ) {

    const cleanQuestion =
      question.trim();


    if (!cleanQuestion) {

      return;

    }


    openChat();


    addMessage(
      cleanQuestion,
      "user"
    );


    input.value = "";


    setLoading(true);


    const statusMessage =
      addMessage(
        "Searching the verified career knowledge base...",
        "status"
      );


    try {

      const response =
        await fetch(
          CAREER_AI_API_URL,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                message:
                  cleanQuestion,

                previousResponseId:
                  previousResponseId

              })

          }
        );


      const data =
        await response.json();


      if (
        statusMessage.isConnected
      ) {

        statusMessage.remove();

      }


      if (!response.ok) {

        throw new Error(

          data.error ||

          "The assistant could not answer right now."

        );

      }


      addMessage(
        data.answer,
        "assistant"
      );


      if (
        data.responseId
      ) {

        previousResponseId =
          data.responseId;


        sessionStorage.setItem(

          "careerAiPreviousResponseId",

          previousResponseId

        );

      }

    }

    catch (error) {

      if (
        statusMessage.isConnected
      ) {

        statusMessage.remove();

      }


      console.error(
        "Career assistant error:",
        error
      );


      addMessage(

        error.message ||

        "The career assistant is temporarily unavailable. Please try again.",

        "assistant"

      );

    }

    finally {

      setLoading(false);

      input.focus();

    }

  }



  /* ----------------------------------------------
     LAUNCHER EVENTS
  ---------------------------------------------- */

  launcher.addEventListener(
    "click",
    () => {

      if (
        chatWindow.classList.contains(
          "show"
        )
      ) {

        closeChat();

      }

      else {

        openChat();

      }

    }
  );



  closeButton.addEventListener(
    "click",
    closeChat
  );



  /* ----------------------------------------------
     FORM
  ---------------------------------------------- */

  form.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      askAssistant(
        input.value
      );

    }
  );



  /* Enter = send
     Shift + Enter = new line
  */

  input.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        form.requestSubmit();

      }

    }
  );



  /* ----------------------------------------------
     SUGGESTED QUESTIONS
  ---------------------------------------------- */

  suggestionButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const question =
            button.dataset.question || "";


          askAssistant(
            question
          );

        }
      );

    }
  );



  /* ----------------------------------------------
     RESET CONVERSATION
  ---------------------------------------------- */

  resetButton.addEventListener(
    "click",
    () => {

      previousResponseId =
        null;


      sessionStorage.removeItem(
        "careerAiPreviousResponseId"
      );


      messages.innerHTML = "";


      addMessage(

        "New conversation started. Ask me about Swapnil's experience, skills, accomplishments, publications, or alignment with your role.",

        "assistant"

      );


      input.focus();

    }
  );



  /* ----------------------------------------------
     ESCAPE KEY CLOSES CHAT
  ---------------------------------------------- */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        chatWindow.classList.contains(
          "show"
        )
      ) {

        closeChat();

      }

    }
  );

});
