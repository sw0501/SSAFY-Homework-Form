const request = require("request");

const fetchInfo = async (req, res, next) => {

    const userId = req.query.user;
    const problemId = req.query.problemId;

    const checkProblem = () => {
        new Promise((res, rej) => {
            const options = {
                method: 'GET',
                url: 'https://solved.ac/api/v3/problem/show',
                qs: {problemId: problemId},
                headers: {Accept: 'application/json'}
            };

            request(options, function (error, response, body) {
                if (error) rej(new Error(error));
            
                if (body === "Not Found" || body=== "Bad Request") {
                    rej(new Error("Problem Not Found"));
                }

                res();
            });    
        })
    }

    const checkUser = () => {
        new Promise((res, rej) => {
            const options = {
                method: 'GET',
                url: 'https://solved.ac/api/v3/user/show',
                qs: { handle: userId },
                headers: {Accept: 'application/json'}
            };
            
            request(options, function (error, response, body) {
                if (error) rej(new Error(error));
            
                if (body === "Not Found" || body=== "Bad Request") {
                    rej(new Error("User Not Found"));
                }

                res();
            }); 
        })
    }

    try {

        await checkProblem()
            .then()
            .catch(function (error) {
                return res.status(500).json({
                    Error: error
                })
            });

        await checkUser()
            .then()
            .catch(function (error) {
                return res.status(500).json({
                    Error: error
                })
            });
        
        next();
        
    } catch (e) {
        console.error(`[${req.method}] ${req.path} in :fetchUser middleware - 에러!`, e);
        return res.status(500).json({
            error: e,
            errorString: e.toString(),
        });
    }
};

module.exports = fetchInfo;