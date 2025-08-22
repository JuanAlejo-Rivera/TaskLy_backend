import mongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
    token: string
    user: Types.ObjectId //esto sirve para relacionar el token con un usuario
    createdAt: Date
}

const tokenSchema: Schema = new Schema({
    token: {
        type: String,
        required: true,
    },
    user: {
        type: Types.ObjectId,
        ref: 'User',
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: "1d" //el usuatio tiene 1 dia para confirmar su cuenta
    },
})

const token = mongoose.model<IToken>('Token', tokenSchema);
export default token;