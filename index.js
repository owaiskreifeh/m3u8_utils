const path = require('path');
const https = require('https');
const url = require('url');

const LANG_MAP = [
    {
        "language": "audioname",
        "translation": {
            "ar": "الأصلي",
            "en": "Original",
            "fr": "Version originale"
        }
    },
    {
        "language": "Original",
        "translation": {
            "ar": "الأصلي",
            "en": "Original",
            "fr": "Version originale"
        }
    },
    {
        "language": "off",
        "translation": {
            "ar": "ايقاف",
            "en": "Off",
            "fr": "Désactivé"
        }
    },
    {
        "language": "ar",
        "translation": {
            "ar": "العربيّة",
            "en": "Arabic",
            "fr": "Arabe"
        }
    },
    {
        "language": "ar_dz",
        "translation": {
            "ar": "العربيّة (الجزائر)",
            "en": "Arabic (Algeria)",
            "fr": "Arabe (Algérie)"
        }
    },
    {
        "language": "ar_bh",
        "translation": {
            "ar": "العربيّة (البحرين)",
            "en": "Arabic (Bahrain)",
            "fr": "Arabe (Bahreïn)"
        }
    },
    {
        "language": "ar_eg",
        "translation": {
            "ar": "العربيّة (مصر)",
            "en": "Arabic (Egypt)",
            "fr": "Arabe (Égypte)"
        }
    },
    {
        "language": "ar_iq",
        "translation": {
            "ar": "العربيّة (العراق)",
            "en": "Arabic (Iraq)",
            "fr": "Arabe (Irak)"
        }
    },
    {
        "language": "ar_jo",
        "translation": {
            "ar": "العربيّة (الأردن)",
            "en": "Arabic (Jordan)",
            "fr": "Arabe (Jordanie)"
        }
    },
    {
        "language": "ar_kw",
        "translation": {
            "ar": "العربيّة (الكويت)",
            "en": "Arabic (Kuwait)",
            "fr": "Arabe (Koweït)"
        }
    },
    {
        "language": "ar_lb",
        "translation": {
            "ar": "العربيّة (لبنان)",
            "en": "Arabic (Lebanon)",
            "fr": "Arabe (Liban)"
        }
    },
    {
        "language": "ar_ly",
        "translation": {
            "ar": "العربيّة (ليبيا)",
            "en": "Arabic (Libya)",
            "fr": "Arabe (Libye)"
        }
    },
    {
        "language": "ar_ma",
        "translation": {
            "ar": "العربيّة (المغرب)",
            "en": "Arabic (Morocco)",
            "fr": "Arabe (Maroc)"
        }
    },
    {
        "language": "ar_om",
        "translation": {
            "ar": "العربيّة (عُمان)",
            "en": "Arabic (Oman)",
            "fr": "Arabe (Oman)"
        }
    },
    {
        "language": "ar_qa",
        "translation": {
            "ar": "العربيّة (قطر)",
            "en": "Arabic (Qatar)",
            "fr": "Arabe (Qatar)"
        }
    },
    {
        "language": "ar_sa",
        "translation": {
            "ar": "العربيّة (المملكة العربيّة السعودية)",
            "en": "Arabic (Saudi Arabia)",
            "fr": "Arabe (Arabie saoudite)"
        }
    },
    {
        "language": "ar_sy",
        "translation": {
            "ar": "العربيّة (سوريا)",
            "en": "Arabic (Syria)",
            "fr": "Arabe (Syrie)"
        }
    },
    {
        "language": "ar_tn",
        "translation": {
            "ar": "العربيّة (تونس)",
            "en": "Arabic (Tunisia)",
            "fr": "Arabe (Tunisie)"
        }
    },
    {
        "language": "ar_ae",
        "translation": {
            "ar": "العربيّة (الإمارات العربيّة المتحدة)",
            "en": "Arabic (U.A.E.)",
            "fr": "Arabe (Émirats arabes unis)"
        }
    },
    {
        "language": "zh_cn",
        "translation": {
            "ar": "الصينية",
            "en": "Chinese",
            "fr": "Chinois"
        }
    },
    {
        "language": "da",
        "translation": {
            "ar": "الدنماركية",
            "en": "Danish",
            "fr": "Danois"
        }
    },
    {
        "language": "nl_be",
        "translation": {
            "ar": "الهولندية",
            "en": "Dutch",
            "fr": "Néerlandais"
        }
    },
    {
        "language": "en",
        "translation": {
            "ar": "الإنجليزية",
            "en": "English",
            "fr": "Anglais"
        }
    },
    {
        "language": "en_au",
        "translation": {
            "ar": "الإنجليزية (أستراليا)",
            "en": "English (Australia)",
            "fr": "Anglais (Australie)"
        }
    },
    {
        "language": "en_gb",
        "translation": {
            "ar": "الإنجليزية (المملكة المتحدة)",
            "en": "English (United Kingdom)",
            "fr": "Anglais (Royaume-Uni)"
        }
    },
    {
        "language": "en_us",
        "translation": {
            "ar": "الإنجليزية (الولايات المتحدة)",
            "en": "English (United States)",
            "fr": "Anglais (États-Unis)"
        }
    },
    {
        "language": "fa",
        "translation": {
            "ar": "الفارسية",
            "en": "Farsi",
            "fr": "Persan"
        }
    },
    {
        "language": "fr_ca",
        "translation": {
            "ar": "الفرنسية (كندا)",
            "en": "French (Canada)",
            "fr": "Français (Canada)"
        }
    },
    {
        "language": "fr",
        "translation": {
            "ar": "الفرنسية",
            "en": "French",
            "fr": "Français"
        }
    },
    {
        "language": "de",
        "translation": {
            "ar": "الألمانية",
            "en": "German",
            "fr": "Allemand"
        }
    },
    {
        "language": "el",
        "translation": {
            "ar": "اليونانية",
            "en": "Greek",
            "fr": "Grec"
        }
    },
    {
        "language": "hi",
        "translation": {
            "ar": "الهندية",
            "en": "Hindi",
            "fr": "Hindi"
        }
    },
    {
        "language": "it",
        "translation": {
            "ar": "الإيطالية",
            "en": "Italian ",
            "fr": "Italien"
        }
    },
    {
        "language": "ja",
        "translation": {
            "ar": "اليابانية",
            "en": "Japanese",
            "fr": "Japonais"
        }
    },
    {
        "language": "ko",
        "translation": {
            "ar": "الكورية",
            "en": "Korean",
            "fr": "Coréen"
        }
    },
    {
        "language": "ku",
        "translation": {
            "ar": "الكردية",
            "en": "Kurdish",
            "fr": "Kurde"
        }
    },
    {
        "language": "ru",
        "translation": {
            "ar": "الروسية",
            "en": "Russian",
            "fr": "Russe"
        }
    },
    {
        "language": "es",
        "translation": {
            "ar": "الإسبانية",
            "en": "Spanish ",
            "fr": "Espagnol"
        }
    },
    {
        "language": "tr",
        "translation": {
            "ar": "التركية",
            "en": "Turkish",
            "fr": "Turc"
        }
    },
    {
        "language": "uk",
        "translation": {
            "ar": "الأوكرانية",
            "en": "Ukrainian",
            "fr": "Ukrainien"
        }
    },
    {
        "language": "ur",
        "translation": {
            "ar": "الأردية",
            "en": "Urdu",
            "fr": "Ourdou"
        }
    },
    {
        "language": "pa",
        "translation": {
            "ar": "الباكستانية",
            "en": "Pakistani",
            "fr": "Pendjabi"
        }
    },
    {
        "language": "pt",
        "translation": {
            "ar": "البرتغالية",
            "en": "Portuguese",
            "fr": "Portugais"
        }
    }
]

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
    baseURL: "https://owais.me/",
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
    translateNameTo: 'en',
    // allowedAudioLanguages: ['ar', 'en'],
    // allowedTextLanguages: ['ar', 'en'],
}

function formatM3U8(str = "", options = defaultOptions) {

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
            if (options.allowedCodecs && !options.allowedCodecs.includes(attr.codecs)) {
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
                    adaptationURL = path.join(options.baseURL, adaptationURL);
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

            if (options.allowedTextLanguages) {
                isTextAllowed = options.allowedTextLanguages.includes(trackLang);
            }

            if (options.allowedAudioLanguages) {
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

                newManifest.push(newRow);
            }


        } else if (row.startsWith(LINE_TAG.TRICK_PLAY)) {
            if (!options.removeTrickPlayTrack) {
                newManifest.push(row);
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
    track = track.replace(uri, path.join(baseUrl, uri))
    console.log("replaced", track)
    return track;
}

function getLangName(lang, translateTo) {
    const object = LANG_MAP.find(l => l.language == lang);
    return object ? object.translation[translateTo] : lang;
}


// main
// const manifestUrl = 'https://d13mimtabamwrr.cloudfront.net/out/v1/ec8143311ce84ab7956abf369edbb5e5/08add7e5c85b4afab267e7b637ecc06f/dd2764caaf08468c961f6ced5857253b/index.m3u8?aws.manifestfilter=video_height:288-576;video_codec:H264;subtitle_language:none'
const manifestUrl = 'https://d13mimtabamwrr.cloudfront.net/out/v1/ec8143311ce84ab7956abf369edbb5e5/08add7e5c85b4afab267e7b637ecc06f/dd2764caaf08468c961f6ced5857253b/index.m3u8'
const req = https.request(manifestUrl, (res) => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        const parsedUrl = url.parse(manifestUrl);
        let pathName = parsedUrl.pathname.split("/");
        pathName.pop();
        const baseURL = parsedUrl.protocol + '//' + parsedUrl.host + pathName.join("/");
        console.log(formatM3U8(body, {
            ...defaultOptions,
            baseURL,
        }));
    });
});
req.on('error', console.error);
req.write(JSON.stringify(url));
req.end();