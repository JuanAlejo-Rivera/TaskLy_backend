import { Request, Response } from "express"
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";


export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            //prevenir duplicados
            const userExist = await User.findOne({ email })
            if (userExist) {
                const error = new Error('El usuario ya esta registrado')
                res.status(409).json({ error: error.message })
                return;
            }

            //creando el usuario
            const user = new User(req.body)
            //hash password
            user.password = await hashPassword(password)

            //Generar token de confirmacion
            const token = new Token()
            token.token = generateToken() // primer token es la variable, .token es el campo del schema
            token.user = user.id // al user del schema le asignamos el id generado por mongoose, cla crear una cuenta nueva

            //enviar el email de confirmacion
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, verifica tu email para confirmarla')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExist = await Token.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(401).json({ error: error.message })
                return;
            }

            const user = await User.findById(tokenExist.user)
            user.confirmed = true;

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])
            res.json('cuanta confirmada correctamente');

        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }

    }


    static login = async (req: Request, res: Response) => {
        try {

            const { email, password } = req.body;

            //verificar si el usuario existe
            const userExist = await User.findOne({ email });
            if (!userExist) {
                const error = new Error('Usuario no encontrado');
                res.status(401).json({ error: error.message });
                return;
            }
            if (!userExist.confirmed) {
                const token = new Token();
                token.user = userExist.id;
                token.token = generateToken();
                await token.save();

                //enviar el email de confirmacion
                AuthEmail.sendConfirmationEmail({
                    email: userExist.email,
                    name: userExist.name,
                    token: token.token
                })

                const error = new Error('Tu cuenta no ha sido confirmada, hemos enviado un email de confirmacion');
                res.status(401).json({ error: error.message });
                return;
            }

            //verificar el password
            const isPasswordCorrect = await checkPassword(password, userExist.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto');
                res.status(401).json({ error: error.message });
                return;
            }

            const token = generateJWT({ id: userExist.id });
            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }

    }


    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //prevenir duplicados
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return;
            }

            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                res.status(403).json({ error: error.message })
                return;
            }


            //Generar token de confirmacion
            const token = new Token()
            token.token = generateToken() // primer token es la variable, .token es el campo del schema
            token.user = user.id // al user del schema le asignamos el id generado por mongoose, cla crear una cuenta nueva

            //enviar el email de confirmacion
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Se envio un nuevo token de confirmacion a tu email')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //prevenir duplicados
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return;
            }


            //Generar token de confirmacion
            const token = new Token()
            token.token = generateToken() // primer token es la variable, .token es el campo del schema
            token.user = user.id // al user del schema le asignamos el id generado por mongoose, cla crear una cuenta nueva
            await token.save();

            //enviar el email de confirmacion
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu email para reestablecer tu password')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExist = await Token.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(401).json({ error: error.message })
                return;
            }

            res.json('Token Valido, define una nueva contraseña');

        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }

    }
    static updatepasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const tokenExist = await Token.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(401).json({ error: error.message })
                return;
            }

            const user = await User.findById(tokenExist.user);
            user.password = await hashPassword(password); //esta es la nueva contraseña ingresada por el usuario

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])


            res.json('La contraseña se actualizo correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la cuenta' });
        }

    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user);
        return;
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body;

        const userExist = await User.findOne({ email })
        if (userExist && userExist.id.toString() !== req.user.id.toString()) {
            const error = new Error('El email ya esta registrado');
            res.status(409).json({ error: error.message });
            return
        }

        console.log(name, email)
        req.user.name = name;
        req.user.email = email;

        try {
            await req.user.save();
            res.send('Perfil actualizado correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body;

        const user = await User.findById(req.user.id);// buscamos el usuario autenticado por el id del token

        const isPasswordCorrect = await checkPassword(current_password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('La contraseña actual es incorrecta');
            res.status(401).json({ error: error.message });
            return;
        }

        try {
            user.password = await hashPassword(password);
            await user.save();
            res.send('Contraseña actualizada correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body;
        const user = await User.findById(req.user.id);// buscamos el usuario autenticado por el id del token

        const isPasswordCorrect = await checkPassword(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('La contraseña es incorrecta');
            res.status(401).json({ error: error.message });
            return;
        }

        res.send('Contraseña correcta');
    }

}