const client = require("cheerio-httpcli");
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const request = require("request");

app.use(bodyParser.json());
app.use(express.static(__dirname + "/Front"));

app.get("/", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
        success: true,
    });
    //res.sendFile(__dirname + "/Front/index.html");
});

app.post("/search", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    const userId = req.body.userId;
    const problemId = req.body.problemId;

    /*
  //문제 태그 정보 가져오기
  const solvedUrl = "https://solved.ac/api/v3/problem/show";
  let queryParams = "?" + encodeURIComponent("problemId") + "=" + problemId;

  const tag = [];

  request(
    {
      url: solvedUrl + queryParams,
      method: "GET",
    },
    function (error, response, body) {
      console.log(JSON.parse(body));
      return res.status(200).json({
        body: JSON.parse(body),
      });
    }
  );
  */

    function careerRefresh() {
        return new Promise((res, rej) => {
            setTimeout(() => {
                //사용자 해결 여부 가져오기
                const userUrl = "https://acmicpc.net/status";
                queryParams = "?" + encodeURIComponent("problem_id") + "=" + problemId;
                queryParams += "&" + encodeURIComponent("user_id") + "=" + userId;
                queryParams += "&" + encodeURIComponent("language_id") + "=" + "-1";
                queryParams += "&" + encodeURIComponent("result_id") + "=" + "-1";
                queryParams += "&" + encodeURIComponent("from_problem") + "=" + "1";

                client.set("headers", {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
                    "Accept-Charset": "utf-8",
                });

                console.log(userUrl + queryParams);
                res(userUrl + queryParams);
            }, 500);
        });
    }

    await careerRefresh().then((url) => {
        let memory;
        let time;

        const param = {};
        client.fetch(url, param, function (err, $, res) {
            if (err) {
                console.log(err);
                return;
            }

            const activate = [];
            const memory = $(this).find("#status-table > tbody > :nth-last-child(1) > .memory").text();
            const time = $(this).find("#status-table > tbody > :nth-last-child(1) > .time").text();

            let message = "메모리: ```" + memory + "kb```\n";
            message += "실행 시간: ```" + time + "ms```\n";

            //반복문으로 태그
            console.log($.html());
            //return res.status(200).json($.text());
        });
    });
});

app.listen(port, () => {
    console.log(`server is listening at localhost:${port}`);
});
