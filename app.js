const express = require('express');
const morgan = require('morgan');
const config = require('./pkg/config/index');
const connectDB = require('./pkg/database');
const bodyParser = require('body-parser');
const userController = require('./pkg/controllers/index');
const jwt = require('jsonwebtoken');

connectDB();

const app = express();

const port = config.getConfigPropertyValue("port");
const { jwt_secret_key: jwt_secret_key } = config.getConfigPropertyValue("security");

app.use(morgan('tiny'));
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Verify Token function
const verifyToken = async (req, res, next) => {
	if (req.headers['authorization']) {
		try {
			let authorization = req.headers['authorization'].split(' ');
			if (authorization[0] !== 'Bearer') {
				return res.status(403).send('Forbidden'); //invalid request
			} else {
				req.jwt = jwt.verify(authorization[1], jwt_secret_key);
				return next();
			}
		} catch (err) {
			return res.status(403).send('Token is not valid!'); //invalid token
		}
	} else {
		return res.status(403).send('Forbidden');
	}
}

app
	.post('/create', userController.createUser)
	.delete('/user/:id', verifyToken, userController.grantAccess('deleteAny', 'user'), userController.deleteUser)
	.patch('/user/:id', verifyToken, userController.grantAccess('updateAny', 'user'), userController.updateUser)
	.post('/mail', userController.sendMail)

// Server
app.listen(port, (err) => {
	if (err) {
		throw new Error(
			`Cannot start server running on http://localhost:${port}`,
			err
		);
	}
	console.log(`Server running on http://localhost:${port}`);
});
