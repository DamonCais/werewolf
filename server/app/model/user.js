module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const UserSchema = new Schema({
        openId: { type: String },
        avatarUrl: { type: String },
        city: { type: String },
        country: { type: String },
        gender: { type: Number },
        language: { type: String },
        nickName: { type: String },
        province: { type: String },

    });
    return mongoose.model('user', UserSchema);
}