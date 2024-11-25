const FCM = require("fcm-node");
let config = require('../../config/config');

module.exports.androidPushNotification = (deviceToken, messageBody, title = "Phloii", additionalData = {}, callback) => {
    console.log('Sending FCM Notification:', { deviceToken, messageBody, additionalData });
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
            try {
                const parsedResponse = JSON.parse(response); 
                console.log("FCM Response:", parsedResponse);
                if (callback) callback(null, parsedResponse);
            } catch (parseError) {
                console.error("Response Parsing Error:", parseError);
                if (callback) callback(parseError, null);
            }
        }
    });
};




