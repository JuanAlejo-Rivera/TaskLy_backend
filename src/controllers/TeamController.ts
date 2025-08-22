import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';



export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body;

        //Find User
        const user = await User.findOne({ email }).select('name email');
        if (!user) {
            const error = new Error('Usuario no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({//buscamos el proyecto por id y luego lo poblamos con el modelo User
            path:'team',
            select: 'name email'
        })
        res.json(project.team);//aqui viene contenido del arreglo con names y correos de los usuarios que pertenecen al proyecto
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body;

        //Find User
        const user = await User.findById(id).select('id');
        if (!id) {
            const error = new Error('Usuario no encontrado');
            res.status(404).json({ error: error.message });
            return;
        }
        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('El usuario ya pertenece al proyecto');
            res.status(400).json({ error: error.message });
            return;
        }

        req.project.team.push(user.id)
        await req.project.save()

        res.send('Ususario agregado correctamente al proyecto')
    }
    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params;

        //esta validacion sirve para verificar que el id del usuario que se quiere eliminar exista en el proyecto, team es
        if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no pertenece al proyecto');
            res.status(400).json({ error: error.message });
            return;
        }

        req.project.team = req.project.team.filter(team => team.toString() !== userId.toString()) // regresa un nuevo arreglo sin el id del usuario ingresado

        await req.project.save();
        res.send('El usuario ha sido eliminado del proyecto correctamente');

    }
}