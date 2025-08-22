import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import User, { IUser } from "../models/User";

//el body es del front al backend
//el headers es del backend al front
//este codigo sirve para traer el jwt del header de la peticion
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}



export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('No Autorizado');
        res.status(401).json({ message: error.message });
        return;
    }

    const token = bearer.split(' ')[1];

    //una vez que se tiene el jwt hay que verificarlo
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //esto verifica que el usuario exista en la base de datos
        if (typeof decoded === 'object' && decoded.id) {// verifica que sea un objeto y que exista el id
            const user = await User.findById(decoded.id).select('_id name email')
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(500).json({ message: 'Token no valido' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Token no valido' });
    }

}