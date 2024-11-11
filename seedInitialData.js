const mongoose = require('mongoose');
const config = require('./config/config');
const exploreRoomModel = require('./models/exploreRoomsModel');
const avatarModel = require('./models/avatarsModel'); 
const settingModel = require('./models/settingsModel');
const reasonArchieveModel = require('./models/reasonsArchieve'); 


const exploreRooms = [
    {
        room: "Looking for love",
        image: "https://media.istockphoto.com/id/1451148505/photo/creative-searching-for-love-concept-red-hearts-and-magnifying-glass-on-light-purple.jpg?s=1024x1024&w=is&k=20&c=EcVsoikpJECFhHjBHgqECgpzwhCZJLO0FroNa66A23E=",
        joined_user_count: 0
    },
    {
        room: "Free tonight",
        image: "https://scontent.fixc1-7.fna.fbcdn.net/v/t1.6435-9/186508507_958937248187091_4731566412721824585_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JLZTDg84qqcQ7kNvgEjnLgs&_nc_ht=scontent.fixc1-7.fna&_nc_gid=AY3sBj0A9Vo44cCUdvbiEi8&oh=00_AYCeqUZCjyZQPWKeU5eyP3ikRv6isx9H6xUqXgL8sGBmUA&oe=6719C025",
        joined_user_count: 0
    },
    {
        room: "Let's be friends",
        image: "https://static3.bigstockphoto.com/3/1/1/large1500/113126102.jpg",
        joined_user_count: 0
    },
    {
        room: "Coffee date",
        image: "https://plus.unsplash.com/premium_photo-1680303989902-84beefe8d9bc?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        joined_user_count: 0
    }
];


const avatars = [
    {
        avatar_image: "https://phloii.s3.amazonaws.com/Secret%20Dating/Avatar/male/avatar1.png",
        gender: "male"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/male/avatar2.png",
        gender: "male"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/male/avatar3.png",
        gender: "male"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/male/avatar4.png",
        gender: "male"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/male/avatar5.png",
        gender: "male"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/male/avatar6.png",
        gender: "male"
    },
    {
        avatar_image: "https://phloii.s3.amazonaws.com/Secret%20Dating/Avatar/female/girlAvatar1.png",
        gender: "female"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/female/girlAvatar2.png",
        gender: "female"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/female/girlAvatar3.png",
        gender: "female"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/female/girlAvatar4.png",
        gender: "female"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/female/girlAvatar5.png",
        gender: "female"
    },
    {
        avatar_image: "https://phloii.s3.eu-north-1.amazonaws.com/Secret%20Dating/Avatar/female/girlAvatar6.png",
        gender: "female"
    },

];


const settings = [
    {
        section: "Contact Us",
        pages: [
            {
                title: "Help & Support",
                content: "These are the help and support you can contact us...",
                slug: "contact-us"
            },
        ]
    },
    {
        section: "Community",
        pages: [
            {
                title: "Community Guidelines",
                content: "These are the guidelines for our community...",
                slug: "community-guidelines"
            },
            {
                title: "Safety Tips",
                content: "This explains the safety tips...",
                slug: "safety-tips"
            },
            {
                title: "Safety Center",
                content: "This explains the safety center...",
                slug: "safety-center"
            }
        ]
    },
    {
        section: "Privacy",
        pages: [
            {
                title: "Cookie Policy",
                content: "Our website uses cookies to enhance your experience...",
                slug: "cookie-policy"
            },
            {
                title: "Privacy Policy",
                content: "Our website uses privacy policy to enhance your experience...",
                slug: "privacy-policy"
            },
            {
                title: "Privacy Preferences",
                content: "Our website uses privacy preferences to enhance your experience...",
                slug: "privacy-preferences"
            }   
        ]
    },
    {
        section: "Legal",
        pages: [
            {
                title: "Licenses",
                content: "This is our license disclaimer...",
                slug: "license"
            },
            {
                title: "Terms of Service",
                content: "These are our terms of service...",
                slug: "terms-of-service"
            }
        ]
    }
];




const reasonsArchieve = [
    { reason: "Fake profile, Scammer",type:'report' },
    { reason: "Nudity or something sexually explicit",type:'report' },
    { reason: "Harassment or bad behaviour",type:'report' },
    { reason: "Physical safety concerns",type:'report' },
    { reason: "I want a fresh start",type:'delete_account' },
    { reason: "I met someone",type:'delete_account' },
    { reason: "Something is broken",type:'delete_account' },
    { reason: "I need a break from Phloii",type:'delete_account' },
    { reason: "I don’t like Phloii",type:'delete_account' },
    { reason: "Other",type:'delete_account' },
];



async function syncCollection(dataArray, Model, modelName, queryField) {
    for (let item of dataArray) {
        const query = {};
        query[queryField] = item[queryField];


        const result = await Model.findOneAndUpdate(
            query,
            { $set: item },
            { new: true, upsert: true } 
        );

        if (result) {
            console.log(`Upserted into ${modelName}: ${result._id}`);
        }
    }
}



async function seedAllData() {
    try {
        
        await syncCollection(exploreRooms, exploreRoomModel, 'Explore Rooms', 'room');

       
        await syncCollection(avatars, avatarModel, 'Avatars', 'avatar_image');

        for (let setting of settings) {

            const result = await settingModel.findOneAndUpdate(

                { section: setting.section },

                { $set: setting },

                { new: true, upsert: true }

            );

            console.log(`Upserted setting section: ${result.section}`);

        }
        await syncCollection(reasonsArchieve, reasonArchieveModel, 'Reason Archieve', 'reason');

        console.log('All data synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing data:', error);
    } finally {
        mongoose.connection.close();
    }
}



mongoose
    .connect(config.development.db_url)
    .then(() => {
        console.log('Connected to MongoDB');
        return seedAllData();
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
