const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const cors = require('cors')

const app = express()

const taskRoutes = require('./api/task/task.routes')

// const q = createQueue()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
        credentials: true
    };
    app.use(cors(corsOptions));
}

app.use(session({
    secret: 'puki muki',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/api/task', taskRoutes)

const logger = require('./services/logger.service')

const port = process.env.PORT || 3002
app.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})



