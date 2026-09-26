function showMessage() {
    alert("Thank you for contacting me!");
}


// ==============================
// OPEN CHATBOT
// ==============================

function openChat() {
    const chatWindow = document.getElementById("chatWindow");

    if (chatWindow) {
        chatWindow.style.display = "flex";
    }
}


// ==============================
// CLOSE CHATBOT
// ==============================

function closeChat() {
    const chatWindow = document.getElementById("chatWindow");

    if (chatWindow) {
        chatWindow.style.display = "none";
    }
}


// ==============================
// SEND MESSAGE TO AI
// ==============================

async function sendMessage() {

    const input = document.getElementById("userInput");
    const chatMessages = document.getElementById("chatMessages");

    if (!input || !chatMessages) {
        return;
    }

    const message = input.value.trim();

    if (message === "") {
        return;
    }


    // USER MESSAGE
    const userMessage = document.createElement("div");

    userMessage.className = "user-message";
    userMessage.textContent = message;

    chatMessages.appendChild(userMessage);

    input.value = "";


    // THINKING MESSAGE
    const botMessage = document.createElement("div");

    botMessage.className = "bot-message";
    botMessage.textContent = "Thinking... 🤖";

    chatMessages.appendChild(botMessage);

    chatMessages.scrollTop = chatMessages.scrollHeight;


    try {

        // CONNECT TO SERVER.JS
        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        const data = await response.json();


        // AI RESPONSE
        if (response.ok && data.reply) {

            botMessage.textContent = data.reply;

        } else {

            botMessage.textContent =
                data.error || "AI نے جواب نہیں دیا۔";

        }

    } catch (error) {

        console.error("Chatbot Error:", error);

        botMessage.textContent =
            "AI سے connection نہیں ہو سکا۔";

    }


    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ==============================
// PRESS ENTER TO SEND
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("userInput");

    if (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                sendMessage();

            }

        });

    }

});