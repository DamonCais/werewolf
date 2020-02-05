module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const BlokusSchema = new Schema({
        blokusId: { type: String },
        openIds: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        score: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                },
                baseIds: { type: Array },
                score: { type: Number },
                canPlay: { type: Boolean }
            }
        ],
        currentPlayer: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        currentStep: {
            type: Number,
        },
        startTime: { type: Date },
        area: { type: Array },
        status: {
            type: String,
            enum: ['NEW', 'PLAYING', 'FINISH', 'EMPTY', 'ERROR'],
            default: 'NEW'
        },

    });

    return mongoose.model('blokus', BlokusSchema);
}