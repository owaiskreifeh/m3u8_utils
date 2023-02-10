const http = require("http");
var url = require('url');

const filter = require('./index');

const port = process.env.PORT || 3000;

// ex: placeholder
// console.log(JSON.stringify({
//     bu: '',
//     ab: true,
//     fl: true,
//     fa: false,
//     ft: false,
//     xh: 2160,
//     nh: 288,
//     da: true,
//     dt: true,
//     tp: false,
//     ac: [],
//     tn: '',
//     au: ['ar', 'en'],
//     at: ['ar', 'en'],
// }))

PARAMS_OPTIONS_MAP = {
    bu: "baseURL",
    ab: "urlsToAbsolutePath",
    fl: "autoFlipTrackLanguage",
    fa: "flipLangTitleAudio",
    ft: "flipLangTitleText",
    xh: "maxHeight",
    nh: "minHeight",
    da: "removeDummyAudio",
    dt: "removeDummyText",
    tp: "removeTrickPlayTrack",
    ac: "allowedCodecs",
    tn: "translateNameTo",
    au: "allowedAudioLanguages",
    at: "allowedTextLanguages",
}


function matchParamsToOptions(params) {
    const options = {};
    for (const [key, value] of Object.entries(params)) {
        if (key in PARAMS_OPTIONS_MAP) {
            options[PARAMS_OPTIONS_MAP[key]] = value;
        } else {
            throw new Error(`Unknown parameter ${key}`);
        }
    }
    return options;
}

const requestListener = async function (req, res) {
    const queryParams = getParams(req);
    const manifestUrl = queryParams.u;

    if (!manifestUrl) {
        res.writeHead(400);
        res.end()
    }

    let options = {};
    if (queryParams.o !== undefined) {  
        try {
            options = matchParamsToOptions(JSON.parse(queryParams.o))
        } catch(e) {
            res.writeHead(400);
            res.end()
        }
    }

    console.log("manifest url", manifestUrl);
    console.log("options", options);

    try {
        const data = await filter(manifestUrl, options);
        for (const [key, value] of Object.entries(data.headers)) {
            if (!key.toLocaleLowerCase().includes("content-length")) {
                res.setHeader(key, value);
            }
        }
        console.log("data", data.filteredManifest.substring(0,10));
        res.setHeader("Content-Length", Buffer.byteLength(data.filteredManifest))
        res.setHeader("x-content-mod", 'yes-moded')
        res.writeHead(200);
        res.end(data.filteredManifest)
    } catch (err) {
        console.log("on response error", err);
        res.writeHead(302, {
            'Location': manifestUrl
        });
        res.end();
    }
};

const server = http.createServer(requestListener);
server.listen(port);
function getParams(req) {
    var urlParts = url.parse(req.url, true);
    return urlParts.query;
}


