import * as connect from 'connect';
import * as http from 'http';

const PORT_NUM = parseInt(process.argv[2]) || 3000;
const app = connect();

const genHtmlDoc = () =>
  `
<!DOCTYPE html>
<html>
<body>

<h1>This is Test</h1>

<p>A random string: ${Math.random()
    .toString(36)
    .substring(7)}</p>

</body>
</html>
`;

let server = null;
let nextResponse = null;
let sentResponses = [];

app.use('/', (req, res) => {
  let resp;
  if (nextResponse) {
    resp = nextResponse;
    nextResponse = null;
  } else {
    resp = genHtmlDoc();
  }
  res.end(resp);
  sentResponses.push(resp);
});

export const setNextResponse = (resp: any) => (nextResponse = resp);
export const getSentResponses = () => sentResponses;
export const startServer = () => {
  //create node.js http server and listen on port
  server = http.createServer(app).listen(PORT_NUM);
};
export const stopServer = () => (server ? server.close() : null);
