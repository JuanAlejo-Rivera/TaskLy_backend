import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string
    password: string;
    name: string;
    confirmed: boolean;
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,// convierte a minusculas los emails
        unique: true, // no se pueden repetir los emails
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false//es false por defecto, ya que el usuario no ha confirmado su cuenta
    }
})
const User = mongoose.model<IUser>('User', userSchema);
export default User;