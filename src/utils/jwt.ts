import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

type UserPayload = {
    id: Types.ObjectId;
}

//no se puede poner informacion sensible en el token, name,card,password, etc
export const generateJWT = (payload: UserPayload) => {

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d' //esta sera la duracion del token
    })
    return token;
}
