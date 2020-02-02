module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const ContentSchema = new Schema({
        roomId: { type: Number },
        contentId: { type: Number },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        content: { type: String },
        date: { type: Date, default: Date.now },
        type: {
            type: String,
            enum: ['QUEST', 'DISCUSS', 'DATE', 'VOTE'],
            default: 'QUEST'
        },
        answer: {
            type: String,
            enum: ['NEW', 'YES', 'NO', 'MAYBE', 'CLOSED', 'UNCLOSED', 'RIGHT'],
            default: 'NEW'
        },

    });

    return mongoose.model('Content', ContentSchema);
}