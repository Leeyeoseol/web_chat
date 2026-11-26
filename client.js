const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const messages = document.getElementById("messages");
chatInput.focus(); //메세지 입력창에 바로 포커싱

function addMessage(sendNickname, message) {
  const li = document.createElement("li");

  //내가보낸거 아니면
  if (sendNickname !== nickname) {
    const nicknameDiv = document.createElement("div");
    nicknameDiv.classList.add("nickname");
    nicknameDiv.textContent = sendNickname;

    li.appendChild(nicknameDiv);
    li.append(message);
  } else {
    li.classList.add("user");
    li.textContent = message;
  }
  //시간 표시
  const timeDiv = document.createElement("div");
  timeDiv.classList.add("time");

  const now = new Date();

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  if (hh === 0) {
    //0시 -> 오전 12시
    timeDiv.textContent = `오전 12:${min}`;
  } else if (hh < 12) {
    //오전 1시 ~ 11시
    timeDiv.textContent = `오전 ${hh}:${min}`;
  } else if (hh === 12) {
    //정오 12시 -> 오후 12시
    timeDiv.textContent = `오후 12:${min}`;
  } else {
    //오후 1시 ~ 11시
    timeDiv.textContent = `오후 ${hh - 12}:${min}`;
  }

  li.appendChild(timeDiv);

  messages.appendChild(li);
}

function timestamp() {
  const date = new Date();
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault(); //화면 깜박거리는 기본 동작 막음

  const messageText = chatInput.value.trim(); //앞 뒤 여백 자르기

  if (!messageText) return; //메세지 없으면 그냥 return

  //서버로 message 날림
  ws.send(JSON.stringify({ type: "chat", text: messageText })); //json -> string
  //addMessage(messageText); //Message 보이게

  chatInput.value = "";
  chatInput.focus();
});

//-------------WevSocket----------------//
const ws = new WebSocket(`ws://${location.host}`); //서버와 연결
const nickname = prompt("당신의 닉네임을 입력하세요").trim() || "익명";

//ws.on("open", () => {});
ws.onopen = () => {
  console.log("서버 연결");
  ws.send(JSON.stringify({ type: "join", text: nickname })); //server에 nickname 보내기
};
ws.onmessage = (event) => {
  //string ->  json
  const data = event.data;
  const json = JSON.parse(data);
  //type: chat -> 채팅창에 추가(li)
  switch (json.type) {
    case "chat":
      //console.log(json.text);
      //화면에 json.test를 보여주도록
      console.log(json.text);
      console.log(json.nickname);
      addMessage(json.nickname, json.text);
      break;
  }
};
ws.onclose = () => {
  console.log("서버 연결 해제");
};
