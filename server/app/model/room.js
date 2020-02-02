module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const RoomSchema = new Schema({
        roomId: { type: Number },
        openIds: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        wolf: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        prophet: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        header: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        startTime: { type: Date },
        playerNum: { type: Number },
        playTime: { type: Number },
        voteTime: { type: Number },
        votes: [
            {
                from: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                },
                to: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                }
            }
        ],
        keyWord: { type: String },
        words: [
            { type: String, }
        ],
        getAnswer: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['NEW', 'PICKING', 'PLAYING', 'VOTEING', 'FINISH', 'EMPTY', 'ERROR'],
            default: 'NEW'
        },

    });

    return mongoose.model('room', RoomSchema);
}