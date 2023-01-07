const User = require('../model/user');
const jwt = require('jsonwebtoken');
const { roles } = require('../roles');
const nodemailer = require("nodemailer");
const ical = require('ical-generator');
const config = require('../config/index');

const { jwt_secret_key: jwt_secret_key } = config.getConfigPropertyValue("security");

module.exports = {

    grantAccess: function (action, resource) {
        return async (req, res, next) => {
            try {
                let modifiedAction = action;
                // Check for userId and modify action from updateAny to updateOwn
                // when current user updates his/her own info
                if (action !== 'deleteAny') {
                    if (req.body.userRequestingChangeID === req.body.user.id) {
                        modifiedAction = action.replace('Any', 'Own');
                    }
                } else {
                    if (req.body.userRequestingChangeID === req.params.id) {
                        return res.status(401).json({
                            error: "User can not delete himself from the database"
                        })
                    }
                }
                const permission = roles.can(req.body.userRequestingChange)[modifiedAction](resource);
                if (!permission.granted) {
                    return res.status(401).json({
                        error: "You don't have enough permission to perform this action"
                    });
                }
                next();
            } catch (error) {
                next(error);
            }
        };
    },

    createUser: async (req, res, next) => {
        try {
            const { firstName, lastName, age, role } = req.body
            const newUser = new User({ firstName, lastName, age, role: role || "basic" });
            const accessToken = jwt.sign({ userId: newUser._id }, jwt_secret_key,
            );
            newUser.accessToken = accessToken;
            await newUser.save();
            res.json({
                data: newUser,
            })
        } catch (error) {
            next(error)
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.body.user.id;
            const updatedData = req.body.user;
            debugger;
            await User.findByIdAndUpdate(userId, updatedData);
            const user = await User.findById(userId);
            res.status(200).json({
                data: user,
                message: 'User has been updated!'
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    },

    deleteUser: async (req, res) => {
        try {
            debugger;
            const id = req.params.id;
            const user = await User.findByIdAndDelete(id)
            res.send(`User with id: ${user.id} has been succesfully deleted!`)
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    },

    sendMail: async (req, res, next) => {
        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: req.body.sender,
                pass: req.body.senderPassword
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        var mailOptions = {
            to: req.body.recipient,
            subject: "Let's discuss NodeJS!",
            html: "<h1>Welcome to the meeting</h1>"
        }
        if (calendar) {
            let alternatives = {
                "Content-Type": "text/calendar",
                "method": "REQUEST",
                "content": new Buffer(calendar.toString()),
                "component": "VEVENT",
                "Content-Class": "urn:content-classes:calendarmessage"
            }
            mailOptions['alternatives'] = alternatives;
            mailOptions['alternatives']['contentType'] = 'text/calendar'
            mailOptions['alternatives']['content']
                = new Buffer(calendar.toString())
        }
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                res.send(error.message);
            } else {
                res.send("Email sent to: " + response.accepted[0]);
            }
        })
    }
}
const calendar = getIcalObjectInstance(new Date(), new Date(), "meeting", 'test', 'skopje', 'https://meet.google.com/kzd-jsjp-qus', 'mete', 'metodija.cvijovikj@yahoo.com')

function getIcalObjectInstance(starttime, endtime, summary, description, location, url, name, email) {
    const cal = ical({ name: 'My test calendar event' });
    starttime.setHours(starttime.getHours() + 1);
    endtime.setHours(starttime.getHours() + 2);
    cal.createEvent({
        start: starttime,
        end: endtime,
        summary: summary,
        description: description,
        location: location,
        url: url,
        organizer: {
            name: name,
            email: email
        },
    });
    return cal;
}
