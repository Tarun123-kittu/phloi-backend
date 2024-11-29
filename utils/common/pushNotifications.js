const admin = require("firebase-admin")
const serviceAccount = require("../../phloii-firebase-adminsdk-3lfji-f8289f98be.json")




admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})



const sendPushNotification = async (registrationToken, message, data = {}, title = "Phloii") => {
    console.log("data ----",data)
    try {
        const messageSend = {
            token: registrationToken,
            notification: {
                title: title,
                body: message
            },
            data: {
                ...data
            },
            android: {
                priority: "high"
            },
            apns: {
                headers: {
                    "apns-priority": "10", 
                },
                payload: {
                    aps: {
                        alert: {
                            title: title,
                            body: message,
                        },
                        // badge: 1,
                        sound: "default"
                    }
                    
                }
            }
        };

        const response = await admin.messaging().send(messageSend);
        console.log("Successfully sent message:", response);
        return response;
    } catch (error) {
        console.error("Error while sending notification:", error);
        throw error;
    }
};



module.exports = sendPushNotification