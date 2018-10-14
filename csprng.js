
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


let apiheaders = new Headers({'Access-Control-Allow-Origin': '*'})
const index = `<!DOCTYPE html>
<head>
<style>
  body {
    max-width:650px;
    margin: 2em auto 4em;
    padding: 0 1rem;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    -webkit-font-smoothing: antialiased;
  }
  ul {
    list-style:none;
    padding-left:0;
  }
  li.spacer {
    padding-top:15px;
  }
  .code {
    font-family:monospace;
    padding-right:25px;
  }
  .codeblock {
    font-family:monospace;
    background-color:#e2e2e2;
    padding:25px;
  }
</style>
</head>
<body>
  <h2>csprng</h2>
  <p>
  <table>
    <tr><td class="code">/v1/api</td><td>Request randomness from Cloudflare's edge servers.</td></tr>
    <tr></tr>
    <tr></tr>
    <tr class="padrow"></tr>
    <tr><td><i>Params:</i></td><td></td></tr>
    <tr><td>length</td><td>Number of bytes. Valid for integer between 1 and 65535. Default 32</td></tr>
    <tr><td>format</td><td>Format of the returned randomness. Values: base64</td></tr>
  </table>
  <h3>Example</h3>
  <pre class="codeblock">
$ curl https://csprng.xyz/v1/api
{
        "Status": 200,
        "Data": "hp7RWuKfuUHWXvAQTUEtRits0chzZWHDjP58nVmwOZM=",
        "Time": "2018-10-14T07:03:39.250Z"
}</pre>
<a href="https://csprng.xyz/v1/api" target="_blank">See for yourself!</a>
</body>
</html>`;

// randombytes performs the generation of the random numbers.
 function randombytes(n) {
  var buf = new Uint8Array(n)
  crypto.getRandomValues(buf)
  var r = btoa(String.fromCharCode.apply(null, buf))
  return buf
}

// respond generates the response object that is returned to clients in a
// reusable way. If the status code isn't 200, the object that is returned
// will say Message and not Data. This is so we don't re-use a field name
// and put clients in to a position where they accidently use an error msg
// as the randomness.
function respond(statusCode, message) {
  var head = "Data"
  if (statusCode != 200) {
    head = "Message"
  }
  var d = new Date().toISOString();
  return new Response(`
  {
        "Status": ` + statusCode + `,
        "` + head + `": "` + message + `",
        "Time": "`+d+`"
  }`, {status:statusCode, headers: apiheaders})
}

// handlRandom is the /v1/api handler.
function handleRandom(url) {
  var n = 32
  if (length = url.searchParams.get("length")) {
    if (length>65535 || length<1) {
      return respond(400, "Invalid byte length. n must be an integer between 0 and 65535.")
    }
    n = length
  }

  buf = randombytes(n)
  var format = "base64"
  if (fmt = url.searchParams.get("format")) {
    format = fmt ? fmt : format;
  }
  
  var r = ""
  switch (format) {
    case "base64":
      r = btoa(String.fromCharCode.apply(null, buf))
      break;
    default:
      return respond(400, "Invalid format. Allowed (base64)")
  }
  return respond(200, r)
}

// handleRequest is the application router
async function handleRequest(request) {
  var url = new URL(request.url)
  switch (url.pathname) {
    case "/v1/api":
      return handleRandom(url)
    default:
      return new Response(index, {headers: new Headers({'Content-type': 'text/html'})});
  }
}
