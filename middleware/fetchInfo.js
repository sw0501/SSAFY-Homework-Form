const request = require("request");

const fetchInfoMiddleware = async (req, res, next) => {
    const userId = req.query.userId;
    const problemId = req.query.problemId;

    const checkProblem = () => {
        return new Promise((res, rej) => {
            const options = {
                method: "GET",
                url: "https://solved.ac/api/v3/problem/show",
                qs: { problemId: problemId },
                headers: { Accept: "application/json" },
            };

            request(options, function (error, response, body) {
                if (error) rej(new Error(error));

                if (body === "Not Found" || body === "Bad Request") {
                    rej(new Error("Problem Not Found"));
                }

                res();
            });
        });
    };

    const checkUser = () => {
        return new Promise((res, rej) => {
            const options = {
                method: "GET",
                url: "https://solved.ac/api/v3/user/show",
                qs: { handle: userId },
                headers: { Accept: "application/json" },
            };

            request(options, function (error, response, body) {
                if (error) rej(new Error(error));

                if (body === "Not Found" || body === "Bad Request") {
                    rej(new Error("User Not Found"));
                }

                res();
            });
        });
    };

    try {
        await checkUser();
        await checkProblem();

        next();
    } catch (e) {
        return res.status(400).json({
            Error: e,
            form: e.toString(),
        });
    }
};

module.exports = fetchInfoMiddleware;
