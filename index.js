const path = require('path');
const https = require('https');
const url = require('url');

const LANG_MAP = require("./languageTabel");

const LINE_TAG = {
    ADAPTATION: "#EXT-X-STREAM-INF",
    TRACK: "#EXT-X-MEDIA",
    TRICK_PLAY: "#EXT-X-I-FRAME-STREAM-INF"
}

const CODECS = {
    H265: "hvc",
    H264: "avc"
}

const NORMALIZED_LANGUAGES = ['qor', 'qar', 'qaa', 'qab', 'qac', 'qad', 'qae'];

const defaultOptions = {
    baseURL: "",
    urlsToAbsolutePath: true,
    autoFlipTrackLanguage: true,
    flipLangTitleAudio: true,
    flipLangTitleText: true,
    maxHeight: Infinity,
    minHeight: 288,
    removeDummyAudio: true,
    removeDummyText: true,
    removeTrickPlayTrack: false,
    allowedCodecs: [CODECS.H264, CODECS.H265],
    changeLanguageForDubbed: false,
    // translateNameTo: '',
    // allowedAudioLanguages: ['ar', 'en'],
    // allowedTextLanguages: ['ar', 'en'],
}

function formatM3U8(str = "", options = defaultOptions) {
    console.log("formatting: ", {options});
    let newManifest = [];

    const rows = str.split("\n");
    const rowsLen = rows.length;
    let currentRow = 0;
    while (currentRow < rowsLen) {
        const row = rows[currentRow];
        if (row.startsWith(LINE_TAG.ADAPTATION)) {
            let adaptationURL = rows[currentRow + 1];
            currentRow += 2;
            const attr = getAttributes(row);

            let allowAdaptation = true;
            if (hasEntries(options.allowedCodecs) && !options.allowedCodecs.includes(attr.codecs)) {
                allowAdaptation = false;
            }

            if (options.maxHeight && options.maxHeight < attr.height) {
                allowAdaptation = false;
            }

            if (options.minHeight && options.minHeight > attr.height) {
                allowAdaptation = false;
            }

            if (allowAdaptation) {
                newManifest.push(row)
                if (!adaptationURL.startsWith("http") && options.urlsToAbsolutePath) {
                    adaptationURL = joinPath(options.baseURL, adaptationURL)
                }
                newManifest.push(adaptationURL);
            }

        } else if (row.startsWith(LINE_TAG.TRACK)) {
            currentRow++;
            const attr = getAttributes(row);
            let newRow = row;

            let trackLang = attr.language;
            const shouldFlip = NORMALIZED_LANGUAGES.includes(trackLang);
            const isDummy = attr.name.includes("dummy") || attr.language.includes("dummy");

            if (options.autoFlipTrackLanguage && shouldFlip) {
                trackLang = attr.name;
            }

            let isTextAllowed = true, isAudioAllowed = true;

            if (attr.type == 'SUBTITLES' && hasEntries(options.allowedTextLanguages)) {
                isTextAllowed = options.allowedTextLanguages.includes(trackLang);
            }

            if (attr.type == 'AUDIO' && hasEntries(options.allowedAudioLanguages)) {
                isAudioAllowed = options.allowedAudioLanguages.includes(trackLang);
            }

            if (isDummy && attr.type == 'SUBTITLES' && options.removeDummyText) {
                isTextAllowed = false;
            }

            if (isDummy && attr.type == 'AUDIO' && options.removeDummyAudio) {
                isAudioAllowed = false;
            }

            if (
                attr.type == 'SUBTITLES' && isTextAllowed ||
                attr.type == 'AUDIO' && isAudioAllowed
            ) {
                if (
                    attr.type == 'SUBTITLES' && shouldFlip && options.flipLangTitleText ||
                    attr.type == 'AUDIO' && shouldFlip && options.flipLangTitleAudio
                ) {
                    newRow = flipLangAttr(row, trackLang, getLangName(trackLang, options.translateNameTo));
                }

                if (!attr.uri.startsWith("http") && options.urlsToAbsolutePath) {
                    newRow = trackURIToAbsolute(newRow, options.baseURL);
                }

                if (options.changeLanguageForDubbed && attr.type == 'AUDIO' && trackLang == 'ar_cl') {
                    newRow = newRow.replace('LANGUAGE="ar_cl"', 'LANGUAGE="ar-dubbed"')
                }

                newManifest.push(newRow);
            }


        } else if (row.startsWith(LINE_TAG.TRICK_PLAY)) {

            if (!options.removeTrickPlayTrack) {
                const attr = getAttributes(row);
                let newRow = row;
                if (!attr.uri.startsWith("http") && options.urlsToAbsolutePath) {
                    newRow = trackURIToAbsolute(newRow, options.baseURL);
                }
                newManifest.push(newRow);
            }
            currentRow++;
        } else {
            currentRow++;
            newManifest.push(row);
        }
    }

    return newManifest.join("\n");
}

function getAttributes(row = "") {
    const rowWithoutTag = row.substring(row.indexOf(":") + 1, row.length);
    const arr = rowWithoutTag.split(",");
    const attributes = {};
    arr.forEach(attr => {
        let [key, value] = attr.split("=");
        if (value) {
            key = key.toLowerCase();
            value = removeQuotations(value)

            if (key == 'resolution') {
                const [width, height] = value.split("x");
                attributes.width = parseInt(width);
                attributes.height = parseInt(height);
            } else if (key == 'codecs') {
                if (value.includes("avc")) {
                    attributes.codecs = CODECS.H264;
                } else if (value.includes("hvc")) {
                    attributes.codecs = CODECS.H265;
                } else {
                    attributes.codecs = value;
                }
            } else {
                attributes[key] = value;
            }
        }
    });

    return attributes;
}

function joinPath(base, path) {
    var url1 = base.split('/');
    var url2 = path.split('/');
    var url3 = [ ];
    for (var i = 0, l = url1.length; i < l; i ++) {
      if (url1[i] == '..') {
        url3.pop();
      } else if (url1[i] == '.') {
        continue;
      } else {
        url3.push(url1[i]);
      }
    }
    for (var i = 0, l = url2.length; i < l; i ++) {
      if (url2[i] == '..') {
        url3.pop();
      } else if (url2[i] == '.') {
        continue;
      } else {
        url3.push(url2[i]);
      }
    }
    return url3.join('/');}

// remove the quotes from the last and first chars if any
function removeQuotations(str = "") {
    if (str.startsWith('"')) {
        str = str.substring(1, str.length)
    }
    if (str.endsWith('"')) {
        str = str.substring(0, str.length - 1)
    }
    return str;
}

function flipLangAttr(str, lang, name) {
    return str
        .replace(/LANGUAGE="[^"]*"/, `LANGUAGE="${lang}"`)
        .replace(/NAME="[^"]*"/, `NAME="${name}"`)
}

function trackURIToAbsolute(track, baseUrl) {
    if (!baseUrl) return track;
    const pattern = /URI="([^"]*)"/;
    const result = track.match(pattern);
    const uri = result[1];
    track = track.replace(uri, joinPath(baseUrl, uri));
    return track;
}

function getLangName(lang, translateTo) {
    if (!translateTo) return lang;
    const object = LANG_MAP.find(l => l.language == lang);
    return object ? object.translation[translateTo] : lang;
}

function hasEntries(arr) {
    return arr && arr.length > 0;
}


module.exports = function filter(manifestUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(manifestUrl, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log("Response to manifest found")
                try {
                    if (res.statusCode !== 200) {
                        reject(res);
                        return;
                    }
                    const parsedUrl = url.parse(manifestUrl);
                    let pathName = parsedUrl.pathname.split("/");
                    pathName.pop();
                    const baseURL = parsedUrl.protocol + '//' + parsedUrl.host + pathName.join("/");
                    console.log({baseURL});
                    const filteredManifest = formatM3U8(body, {
                        ...defaultOptions,
                        baseURL,
                        ...options
                    });
                    resolve({
                        filteredManifest,
                        headers: res.headers,
                    });
                } catch (e) {
                    console.log("Response to manifest not found", e)

                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(url));
        req.end();
    })
}
