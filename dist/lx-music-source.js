/*!
 * @name A lx-music source
 * @description v1.0.5
 * @version v1.0.5
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/lx.js
const { EVENT_NAMES: lx_EVENT_NAMES, on, send: lx_send, request, utils: lxUtils, version } = window.lx
console.log(window.lx)


// https://github.com/lyswhut/lx-music-desktop/blob/master/FAQ.md#windowlxutils
const utils = {
  buffer: {
    from: lxUtils.buffer.from,
    bufToString: lxUtils.buffer.bufToString,
  },
  crypto: {
    aesEncrypt: lxUtils.crypto.aesEncrypt,
    md5: lxUtils.crypto.md5,
    randomBytes: lxUtils.crypto.randomBytes,
    rsaEncrypt: lxUtils.crypto.rsaEncrypt,
  },
}



;// CONCATENATED MODULE: ./src/apis/kw.js


const qualitys = {
  '128k': '128kmp3',
  '320k': '320kmp3',
  // ape: 'ape',
  // flac: 'flac',
}


let token = ''
let cookie = ''
let key = ''

function encrypt(str, pwd) {
  if (pwd == null || pwd.length <= 0) {
    console.log('Please enter a password with which to encrypt the message.')
    return null
  }
  let prand = ''
  for (let i = 0; i < pwd.length; i++) {
    prand += pwd.charCodeAt(i).toString()
  }
  let sPos = Math.floor(prand.length / 5)
  let mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5))
  let incr = Math.ceil(pwd.length / 2)
  let modu = Math.pow(2, 31) - 1
  if (mult < 2) {
    console.log('Algorithm cannot find a suitable hash. Please choose a different password. \nPossible considerations are to choose a more complex or longer password.')
    return null
  }
  let salt = Math.round(Math.random() * 1000000000) % 100000000
  prand += salt
  while (prand.length > 10) {
    prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString()
  }
  prand = (mult * prand + incr) % modu
  let enc_chr = ''
  let enc_str = ''
  for (let i = 0; i < str.length; i++) {
    enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255))
    if (enc_chr < 16) {
      enc_str += '0' + enc_chr.toString(16)
    } else enc_str += enc_chr.toString(16)
    prand = (mult * prand + incr) % modu
  }
  salt = salt.toString(16)
  while (salt.length < 8)salt = '0' + salt
  enc_str += salt
  return enc_str
}
const createToken = (cookieToken, currentKey) => {
  if (currentKey && key != currentKey) key = currentKey
  return encrypt(cookieToken, key)
}
const parseCookieToken = (cookies) => {
  if (!cookies) return ''
  let cookieToken = cookies.find(str => str.startsWith('Hm_Iuvt_'))
  if (!cookieToken) return ''
  cookieToken = cookieToken.split(';')[0]
  cookie = cookieToken
  cookieToken = cookieToken.split('=')[1]
  return cookieToken
}
const getToken = () => new Promise((resolve, reject) => {
  let defaultKey = 'Hm_Iuvt_cdb524f42f0ce19b169a8071123a4700'
  request('http://www.kuwo.cn/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
      Referer: 'http://www.kuwo.cn/',
    },
  }, function(error, response) {
    if (error) return reject(new Error('failed'))
    const token = parseCookieToken(response.headers['set-cookie'])
    if (!token) return reject(new Error('Invalid cookie'))
    const result = response.body.match(/app\.\w+\.js/)
    if (result) {
      request(`https://h5static.kuwo.cn/www/kw-www/${result[0]}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
          Referer: 'http://www.kuwo.cn/',
        },
      }, function(error, response) {
        if (error) return resolve(createToken(token, defaultKey))
        const result = response.body.match(/Hm_Iuvt_(\w+)/)
        if (result) {
          resolve(createToken(token, result[0]))
        } else resolve(createToken(token, defaultKey))
      })
    } else {
      resolve(createToken(token, defaultKey))
    }
  })
})

/* harmony default export */ const kw = ({
  info: {
    name: '酷我音乐',
    type: 'music',
    actions: ['musicUrl'],
    qualitys: ['128k', '320k'],
  },

  async musicUrl({ songmid }, quality) {
    quality = qualitys[quality]

    const target_url = `http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${songmid}&type=music&br=${quality}`
    // const target_url = `http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${songmid}&type=convert_url3&br=${quality}`
    /* const target_url = 'https://www.kuwo.cn/url?'
      + `format=mp3&rid=${song_id}&response=url&type=convert_url3&br=128kmp3&from=web`;
    https://m.kuwo.cn/newh5app/api/mobile/v1/music/src/${song_id} */

    if (!token) token = await getToken()

    return new Promise((resolve, reject) => {
      // console.log(songmid, quality)
      request(target_url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
          Referer: 'http://kuwo.cn/',
          Secret: token,
          cookie,
        },
      }, (err, resp) => {
        console.log(resp.body)
        if (err) return reject(err)
        if (resp.body.code != 200) return reject(new Error('failed'))

        resolve(resp.body.data.url)
      })
    })
  },
});

;// CONCATENATED MODULE: ./src/apis/kg.js


// const qualitys = {
//   '128k': 'PQ',
//   '320k': 'HQ',
//   flac: 'SQ',
//   flac32bit: 'ZQ',
// }

// https://github.com/listen1/listen1_chrome_extension/blob/master/js/provider/kugou.js
/* harmony default export */ const kg = ({
  info: {
    name: '酷狗音乐',
    type: 'music',
    actions: ['musicUrl'],
    qualitys: ['128k'],
  },

  musicUrl({ hash, albumId }, quality) {
    // quality = qualitys[quality]
    let target_url = `https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${hash}&platid=4&album_id=${albumId}&mid=00000000000000000000000000000000`
    return new Promise((resolve, reject) => {
      console.log(hash, quality)
      request(target_url, {
        method: 'GET',
      }, (err, resp) => {
        console.log(resp.body)
        if (err) return reject(err)
        const data = resp.body

        if (data.status !== 1) return reject(new Error(data.err_code))
        if (data.data.privilege > 9) return reject(new Error('failed'))

        resolve(resp.body.data.play_backup_url)
      })
    })
  },
});

;// CONCATENATED MODULE: ./src/apis/tx.js


const fileConfig = {
  '128k': {
    s: 'M500',
    e: '.mp3',
    bitrate: '128kbps',
  },
  '320k': {
    s: 'M800',
    e: '.mp3',
    bitrate: '320kbps',
  },
  flac: {
    s: 'F000',
    e: '.flac',
    bitrate: 'FLAC',
  },
}

// https://github.com/listen1/listen1_chrome_extension/blob/master/js/provider/qq.js
/* harmony default export */ const tx = ({
  info: {
    name: '企鹅音乐',
    type: 'music',
    actions: ['musicUrl'],
    qualitys: ['128k'],
  },

  musicUrl({ songmid }, quality) {
    const target_url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
    // thanks to https://github.com/Rain120/qq-music-api/blob/2b9cb811934888a532545fbd0bf4e4ab2aea5dbe/routers/context/getMusicPlay.js
    const guid = '10000'
    const songmidList = [songmid]
    const uin = '0'

    const fileInfo = fileConfig[quality]
    const file =
      songmidList.length === 1 &&
      `${fileInfo.s}${songmid}${songmid}${fileInfo.e}`

    const reqData = {
      req_0: {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
          filename: file ? [file] : [],
          guid,
          songmid: songmidList,
          songtype: [0],
          uin,
          loginflag: 1,
          platform: '20',
        },
      },
      loginUin: uin,
      comm: {
        uin,
        format: 'json',
        ct: 24,
        cv: 0,
      },
    }
    return new Promise((resolve, reject) => {
      console.log(songmid, quality)
      request(`${target_url}?format=json&data=${JSON.stringify(reqData)}`, {
        method: 'GET',
        headers: {
          channel: '0146951',
          uid: 1234,
        },
      }, (err, resp) => {
        console.log(resp.body)
        if (err) return reject(err)
        const data = resp.body
        const { purl } = data.req_0.data.midurlinfo[0]

        // vip
        if (purl === '') return reject(new Error('failed'))

        const url = data.req_0.data.sip[0] + purl

        resolve(url)
      })
    })
  },
});

;// CONCATENATED MODULE: ./src/utils.js



const buf2hex = buffer => { // buffer is an ArrayBuffer
  return version
    ? utils.buffer.bufToString(buffer, 'hex')
    : [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
}

const aesEncrypt = (data, eapiKey, iv, mode) => {
  if (!version) {
    mode = mode.split('-').pop()
  }
  return utils.crypto.aesEncrypt(data, mode, eapiKey, iv)
}

const md5 = str => utils.crypto.md5(str)


const showUpdateAlert = () => {
  send(EVENT_NAMES.updateAlert, {
    log: 'hello world',
    updateUrl: 'https://xxx.com',
  })
}

;// CONCATENATED MODULE: ./src/apis/wy.js



const wy_qualitys = {
  '128k': 128000,
  '320k': 320000,
  flac: 999000,
}
const eapi = (url, object) => {
  const eapiKey = 'e82ckenh8dichen8'

  const text = typeof object === 'object' ? JSON.stringify(object) : object
  const message = `nobody${url}use${text}md5forencrypt`
  const digest = md5(message)
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`
  return {
    params: buf2hex(aesEncrypt(data, eapiKey, '', 'aes-128-ecb')).toUpperCase(),
  }
}

let wy_cookie = 'os=pc'

// https://github.com/listen1/listen1_chrome_extension/blob/master/js/provider/netease.js
/* harmony default export */ const wy = ({
  info: {
    name: '网易音乐',
    type: 'music',
    actions: ['musicUrl'],
    qualitys: ['128k'],
  },

  musicUrl({ songmid }, quality) {
    quality = wy_qualitys[quality]
    const target_url = 'https://interface3.music.163.com/eapi/song/enhance/player/url'
    const eapiUrl = '/api/song/enhance/player/url'

    const d = {
      ids: `[${songmid}]`,
      br: quality,
    }
    const data = eapi(eapiUrl, d)

    return new Promise((resolve, reject) => {
      console.log(songmid, quality)
      request(target_url, {
        method: 'POST',
        form: data,
        headers: {
          cookie: wy_cookie,
        },
      }, (err, resp) => {
        console.log(resp.body)
        if (err) return reject(err)
        if (resp.headers.cookie) wy_cookie = resp.headers.cookie

        let res_data = resp.body
        const { url } = res_data.data[0]
        if (!url) return reject(new Error('failed'))
        resolve(url)
      })
    })
  },
});

;// CONCATENATED MODULE: ./src/apis/mg.js


const mg_qualitys = {
  '128k': 'PQ',
  '320k': 'HQ',
  flac: 'SQ',
  flac24bit: 'ZQ',
}

// https://github.com/listen1/listen1_chrome_extension/blob/master/js/provider/migu.js
/* harmony default export */ const mg = ({
  info: {
    name: '咪咕音乐',
    type: 'music',
    actions: ['musicUrl'],
    qualitys: ['128k', '320k', 'flac', 'flac24bit'],
  },

  musicUrl({ songmid }, quality) {
    quality = mg_qualitys[quality]
    /*
    const copyrightId = track.id.slice('mgtrack_'.length);
    const type = 1;
    // NOTICE：howler flac support is not ready for production.
    // Sometimes network keep pending forever and block later music.
    // So use normal quality.
    // switch (track.quality) {
    //   case '110000':
    //     type = 2;
    //     break;
    //   case '111100':
    //     type = 3;
    //     break;
    //   case '111111':
    //     type = 4;
    //     break;
    //   default:
    //     type = 1;
    // }
    const k =
      '4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e';
    // type parameter for music quality: 1: normal, 2: hq, 3: sq, 4: zq, 5: z3d
    const plain = forge.util.createBuffer(
      `{"copyrightId":"${copyrightId}","type":${type},"auditionsFlag":0}`
    );
    const salt = forge.random.getBytesSync(8);
    const derivedBytes = forge.pbe.opensslDeriveBytes(k, salt, 48);
    const buffer = forge.util.createBuffer(derivedBytes);
    const key = buffer.getBytes(32);
    const iv = buffer.getBytes(16);
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(plain);
    cipher.finish();
    const output = forge.util.createBuffer();
    output.putBytes('Salted__');
    output.putBytes(salt);
    output.putBuffer(cipher.output);
    const aesResult = forge.util.encode64(output.bytes());
    const publicKey =
      '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8asrfSaoOb4je+DSmKdriQJKW\nVJ2oDZrs3wi5W67m3LwTB9QVR+cE3XWU21Nx+YBxS0yun8wDcjgQvYt625ZCcgin\n2ro/eOkNyUOTBIbuj9CvMnhUYiR61lC1f1IGbrSYYimqBVSjpifVufxtx/I3exRe\nZosTByYp4Xwpb1+WAQIDAQAB\n-----END PUBLIC KEY-----';
    const secKey = forge.util.encode64(
      forge.pki.publicKeyFromPem(publicKey).encrypt(k)
    );
    const target_url = `https://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo?dataType=2&data=${encodeURIComponent(
      aesResult
    )}&secKey=${encodeURIComponent(secKey)}`;
    */
    const target_url = `https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.2?netType=01&resourceType=E&songId=${songmid}&toneFlag=${quality}`
    return new Promise((resolve, reject) => {
      console.log(songmid, quality)
      request(target_url, {
        method: 'GET',
        headers: {
          channel: '0146951',
          uid: 1234,
        },
      }, (err, resp) => {
        console.log(resp.body)
        if (err) return reject(err)
        let playUrl = resp.body.data?.url
        if (!playUrl) return reject(new Error('failed'))

        if (playUrl.startsWith('//')) playUrl = `https:${playUrl}`

        resolve(playUrl.replace(/\+/g, '%2B'))
      })
    })
  },
});

;// CONCATENATED MODULE: ./src/apis/index.js







/* harmony default export */ const apis = ({
  kw: kw,
  kg: kg,
  tx: tx,
  wy: wy,
  mg: mg,
});

;// CONCATENATED MODULE: ./src/index.js



// console.log(window.lx)

on(lx_EVENT_NAMES.request, ({ source, action, info }) => {
  switch (action) {
    case 'musicUrl':
      return apis[source].musicUrl(info.musicInfo, info.type).catch((err) => {
        console.log(err.message)
        return Promise.reject(err)
      })
  }
})

const sources = {}
for (const [source, apiInfo] of Object.entries(apis)) {
  sources[source] = apiInfo.info
}

lx_send(lx_EVENT_NAMES.inited, {
  status: true,
  // openDevTools: true,
  // eslint-disable-next-line no-undef
  openDevTools: "production" === 'development',
  sources,
})

/******/ })()
;