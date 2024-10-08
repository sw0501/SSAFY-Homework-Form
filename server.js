const client = require("cheerio-httpcli");
const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");

const port = 443;
// const port = 3000;

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const fs = require("fs");
const fetchInfo = require("./middleware/fetchInfo");

const options = {
  key: fs.readFileSync("./KEY/cert.key"),
  cert: fs.readFileSync("./KEY/cert.crt"),
};

app.use(bodyParser.json());
app.use(express.static(__dirname + "/Front"));

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
  });
});

app.get("/search" /*, fetchInfo*/, async (req, res) => {
  const userId = req.query.userId;
  const problemId = req.query.problemId;
  const idea1 = req.query.idea1;
  const idea2 = req.query.idea2;
  const idea3 = req.query.idea3;

  let message = "";

  function getProblemInfo() {
    return new Promise((res, rej) => {
      //문제 태그 정보 가져오기
      const solvedUrl = "https://solved.ac/api/v3/problem/show";
      let queryParams = "?" + encodeURIComponent("problemId") + "=" + problemId;

      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: solvedUrl + queryParams,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          // console.log(response.data);
          const data = response.data;
          message += "#### BOJ " + data.problemId + " " + data.titleKo + "<br>";
          message += "태그 : ";

          for (let i = 0; i < data.tags.length; i++) {
            message += data.tags[i].displayNames[0].name;
            if (i != data.tags.length - 1) {
              message += ", ";
            } else {
              message += "<br>";
            }
          }

          res();
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  function getUserInfo() {
    return new Promise((res, rej) => {
      //사용자 해결 여부 가져오기
      const userUrl = "https://acmicpc.net/status";
      queryParams = "?" + encodeURIComponent("problem_id") + "=" + problemId;
      queryParams += "&" + encodeURIComponent("user_id") + "=" + userId;
      queryParams += "&" + encodeURIComponent("language_id") + "=" + "-1";
      queryParams += "&" + encodeURIComponent("result_id") + "=" + "-1";
      queryParams += "&" + encodeURIComponent("from_problem") + "=" + "1";

      client.set("headers", {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
        "Accept-Charset": "utf-8",
      });

      res(userUrl + queryParams);
    });
  }

  await getProblemInfo();

  await getUserInfo().then((url) => {
    const param = {};
    const func = () => {
      return new Promise((res, rej) => {
        client.fetch(url, param, function (err, $) {
          if (err) {
            rej(err);
          }

          //console.log($.html());
          // const memory = $("#status-table > tbody > tr:first-child > .memory").text();
          const memoryElement = $(".memory")[0].children[0];
          const timeElement = $(".time")[0].children[0];

          if (!memoryElement || !timeElement) {
            return rej(new Error("User Not Solved Problem or elements not found"));
          }
          
          const memory = memoryElement.data;
          const time = timeElement.data;

          if (memory === "" && time === "") {
            return rej(new Error("User Not Solved Problem"));
          }

          message += "메모리: ```" + Number.parseInt(memory).toLocaleString("ko-KR") + "kb```<br>";
          message += "실행 시간: ```" + Number.parseInt(time).toLocaleString("ko-KR") + "ms```<br>";
          message += "아이디어: <br>";

          if (idea1 !== "") {
            message += "- " + idea1.toString() + "<br>";
          }
          if (idea2 !== "") {
            message += "- " + idea2.toString() + "<br>";
          }
          if (idea3 !== "") {
            message += "- " + idea3.toString() + "<br>";
          }

          return res(message);
        });
      });
    };
    func()
      .then((message) => {
        return res.status(200).json({
          form: message,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          Error: error,
          form: error.toString(),
        });
      });
  });
});

app.get("/title", async (req, res) => {
  res.sendFile(__dirname + "/Front/title.html");
});

app.get("/title/:problemId", async (req, res) => {
  const problemId = req.params.problemId;

  const today = new Date();

  let message = "## ";

  message += ("00" + (today.getMonth() + 1)).slice(-2);
  message += ("00" + today.getDate()).slice(-2);
  message += " BOJ " + problemId + " ";

  function getProblemInfo() {
    return new Promise((res, rej) => {
      //문제 태그 정보 가져오기
      const solvedUrl = "https://solved.ac/api/v3/problem/show";
      let queryParams = "?" + encodeURIComponent("problemId") + "=" + problemId;

      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: solvedUrl + queryParams,
        headers: {},
      };

      axios
        .request(config)
        .then((response) => {
          const data = response.data;
          message += data.titleKo + "<br>";
          message += "[https://www.acmicpc.net/problem/" + problemId + "]";
          message += "(https://www.acmicpc.net/problem/" + problemId + ")";
          res();
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  await getProblemInfo();

  return res.status(200).json({
    title: message,
  });
});

https.createServer(options, app).listen(port, () => {
    console.log(`server is listening at localhost:${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is listening at http://localhost:${port}`); // http server for test  });
// });
