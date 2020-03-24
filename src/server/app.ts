const express = require('express');
const os = require('os');

const app = express();

app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username + '12345' }));

app.listen(process.env.PORT || 8080, () => console.log(`123 Listening on port ${process.env.PORT || 8080}!`));
