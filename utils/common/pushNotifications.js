const FCM = require("fcm-node");
let config = require('../../config/config')

module.exports.androidPushNotification = (deviceToken, messageBody, title = "Phloii", additionalData = {}, callback) => {
    const serverKey = config.development.fcm_server_key; 
    const fcm = new FCM(serverKey);

    const message = {
        to: deviceToken,
        collapse_key: title,
        content_available: true,
        priority: "high",
        notification: {
            title: title, 
            body: messageBody, 
            sound: "default",
        },
        data: {
            message: messageBody,
            ...additionalData, 
        },
    };

    fcm.send(message, (err, response) => {
        if (err) {
            console.error("FCM Error:", err);
            if (callback) callback(err, null);
        } else {
            console.log("FCM Response:", response);
            if (callback) callback(null, response);
        }
    });
};
