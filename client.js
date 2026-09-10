const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const messages = document.getElementById("messages");

function addMessage(messageText) {
    const message = document.createElement("li");
    message.textContent = messageText;
    messages.appendChild(message);
}

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();//화면 깜박거리는 기본 동작 막음

    const messageText = chatInput.value.trim();//앞 뒤 여백 자르기

    if (!messageText) return;//메세지 없으면 그냥 return

    addMessage(messageText);

    chatInput.value = "";
    chatInput.focus();
});
