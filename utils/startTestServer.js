
const connect = require('connect');
const http = require('http');

const PORT_NUM = parseInt(process.argv[2]) || 3000;
const app = connect();

const genHtmlDoc = () =>
`
<!DOCTYPE html>
<html>
<body>

<h1>This is Test</h1>

<p>A random string: ${Math.random().toString(36).substring(7)}</p>

</body>
</html>
`;

app.use('/', (req, res) => {
    const dateAndTime = new Date().toString();
    res.end(genHtmlDoc())
})

//create node.js http server and listen on port
console.log(`starting server on port ${PORT_NUM}`)
http.createServer(app).listen(PORT_NUM);