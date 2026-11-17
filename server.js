const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "localhost";
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function send(
  res,
  statusCode,
  body,
  contentType = "text/plain; charset=utf-8",
) {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed");
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(
      new URL(req.url, `http://${req.headers.host}`).pathname,
    );
  } catch {
    return send(res, 400, "Bad Request");
  }

  // 요청 경로가 서비스 디렉터리 밖으로 벗어나지 않도록 검사합니다.
  const requestedPath = path.resolve(PUBLIC_DIR, `.${urlPath}`);
  if (
    requestedPath !== PUBLIC_DIR &&
    !requestedPath.startsWith(`${PUBLIC_DIR}${path.sep}`)
  ) {
    return send(res, 403, "Forbidden");
  }

  fs.stat(requestedPath, (statError, stats) => {
    if (statError) return send(res, 404, "Not Found");

    const filePath = stats.isDirectory()
      ? path.join(requestedPath, "index.html")
      : requestedPath;
    fs.readFile(filePath, (readError, data) => {
      if (readError) return send(res, 404, "Not Found");

      const contentType =
        MIME_TYPES[path.extname(filePath).toLowerCase()] ||
        "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      if (req.method === "HEAD") return res.end();
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Static server running at http://${HOST}:${PORT}`);
  console.log(`Serving directory: ${PUBLIC_DIR}`);
});

//---------------------WebSocket Server---------------------//
const { WebSocketServer } = require("ws");
// const { timeStamp } = require("console");
const clients = new Set(); //집합: 중복 X
const users = new Map(); //ws {nickname}
let nextMessageId = 0; //broadcastMessage id: 1씩 증가, 고유의 값

function broadcast(broadcastMessage) {
  //boradcastMessage -> string: data
  const data = JSON.stringify(broadcastMessage);
  // clients 목록에서 하나씩 꺼내어 client -> 상태 === WebSocket.OPEN인 client.send(broadcastMessage);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

//http 서버: 정적 파일(html, css, js ...) 서비스
//WebSocket 서버: 실시간 서비스
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("클라이언트 연결");
  //client 목록에 client 추가하기
  clients.add(ws);

  //clinet에서 send한 것을 받는 위치
  ws.on("message", (data) => {
    let json;
    try {
      json = JSON.parse(data); //string -> json
    } catch (error) {
      return; //이상한 메세지 무시
    }

    switch (json.type) {
      case "join":
        console.log("nickname 수신: ", json.text);
        users.set(ws, { nickname: json.text });
        break;
      case "chat":
        console.log("chat 수신: ", json.text);
        //nickname 알아내기: ws -> ws{nickname} 에서 찾아서 -> nickname 속성에 넣기
        const user = users.get(ws); //{nickname:""}
        const broadcastMessage = {
          type: json.type,
          text: json.text,
          id: nextMessageId++,
          timeStamp: Date.now(),
          nickname: user ? user.nickname : "익명",
        };
        broadcast(broadcastMessage);
        console.log("broadcast: ", broadcastMessage);
        break;
    }
    //임시로 출력
    // console.log(clients);
  });
  ws.on("close", () => {
    console.log("클라이언트 연결 해제");
    //client 목록에서 client 삭제하기
    clients.delete(ws);
    users.delete(ws);
  });
});
