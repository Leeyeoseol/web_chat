# 실시간 채팅 서비스 제작

1. 개발 환경 구축, JavaScript 실행
   - Visual Studio Code
     - Codex 확장기능
   - Git
   - Node.js
   ```shell
   node server.js
   ```
2. 정적 파일(html, css, js) 서버
   - server.js
     - server = http.createServer()
     - server.listen()
     - index.html
       - #app
         - header
         - ul#messages
         - form#chat-form
           - input#chat-input
           - button
     - ## reset.css
       - ul
     - style.css
     - client.js
       - addEventListener("submit", (event) =>{})
       - addMessage()
3. Websocket
   1. `npm install ws`
      - webSocketServer, webSocket
      - server.js
        - wss.on("connection", () => {});
          - ws.on("message", (data) => {}); //string -> json
          - ws.on("close", () => {});
      - client.js
        - chatForm.addEventListener("submit", ...)
          - ws.send({ type: "messages", text }); //json -> string
        - ws.onopen = () => {};
        - ws.onclose = () => {};
   2. Broadcast
   - client A -> Server -> 모든 client
   - client B -> Server -> 모든 client
   - server.js
     - 연결된 client들 목록
       - wss.on("connection",) 할때, client 추가
       - ws.on("close",) 할때, client 삭제
     - message 수신 -> message 객체 -> broadcast()
       - broadcastMessage = {type, text, id, timestamp}
       - broadcast() = client 목록에서 WebSocket.OPEN인 client에세 send()
   - client.js
     - message 송신 -> Server: send() when submit
     - message 수신(onmessage()) -> adMessage()
   3. nickname
   - client A -> Server -> 모든 client
   - client B -> Server -> 모든 client
   - server.js
     - 연결된 client들 목록
       - wss.on("connection",) 할때, client 추가
       - ws.on("message",) 그리고 type "join"이면 users {ws, {nickname}}
       - ws.on("close",) 할때, client 삭제, users에서 ws 삭제
     - message 수신 -> message 객체 -> broadcast()
       - broadcastMessage = {type, text, id, timestamp nickname}
       - broadcast() = client 목록에서 WebSocket.OPEN인 client에세 send()
   - client.js
     - nickname 설정하기
     - message 송신 -> Server: send({"join" : nickname})
     - message 송신 -> Server: send() when submit
     - message 수신(onmessage()) -> adMessage(nickname, text)
