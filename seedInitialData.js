const mongoose = require('mongoose');
const config = require('./config/config');
const exploreRoomModel = require('./models/exploreRoomsModel');
const avatarModel = require('./models/avatarsModel'); 
const settingModel = require('./models/settingsModel')


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


const setting = [
    {
        heading:'Help & Support',
        type:'contact us'
    },
    {
        heading:'Help & Support',
        type:'community'
    },
    {
        heading:'Help & Support',
        type:'community'
    },
    {
        heading:'Help & Support',
        type:'community'
    },
    {
        heading:'Help & Support',
        type:'privacy'
    },
    {
        heading:'Help & Support',
        type:'privacy'
    },
    {
        heading:'Help & Support',
        type:'privacy'
    },
    {
        heading:'legal',
        type:'legal'
    },
    {
        heading:'legal',
        type:'legal'
    }
]


async function syncCollection(dataArray, Model, modelName, queryField) {
    for (let item of dataArray) {
        const query = {};
        query[queryField] = item[queryField];

        // For avatars, change the query to use avatar_image
        if (modelName === 'Avatars') {
            query[queryField] = item.avatar_image; // unique query for avatars
        }

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
        // Sync explore rooms using room name as the unique identifier
        await syncCollection(exploreRooms, exploreRoomModel, 'Explore Rooms', 'room');

        // Sync avatars using avatar_image as the unique identifier
        await syncCollection(avatars, avatarModel, 'Avatars', 'avatar_image');

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
