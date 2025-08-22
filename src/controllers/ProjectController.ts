import { param } from 'express-validator';
import type { Request, Response } from 'express'
import Project from '../models/Project'


export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        console.log(req.user)

        //Asigna el creador del proyecto
        project.manager = req.user.id

        try {
            await project.save()
            res.send('Proyecto creado con éxito')
        } catch (error) {
            console.log(error)
        }
    }
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            //or y in son parametros de mongo, sirven para buscar en varios campos
            // $in: busca si el id del usuario esta en el campo manager

            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },// trae solo los proyectos que el usuario creo
                    { team: { $in: req.user.id } } // trae los proyectos en los que el usuario esta como colaborador
                ]
            })
            res.json(projects)// lo retornamso como json por que es un objeto
        } catch (error) {

        }
    }
    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id).populate('tasks')
            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }
            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {//si el id del manager no es igual al id del usuario autenticado y el id del usuario autenticado no esta en el equipo del proyecto, no tiene permiso
                //req.user.id es el id del usuario autenticado, project.manager es el id del creador del proyecto
                const error = new Error('Acción no válida')
                res.status(404).json({ error: error.message })
                return
            }
            res.json(project)// lo retornamso como json por que es un objeto
        } catch (error) {

        }
    }

    static updateProject = async (req: Request, res: Response) => {
        try {

            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description

            await req.project.save()
            res.send('Proyecto actualizado con éxito')

        } catch (error) {

        }
    }
    static deleteProject = async (req: Request, res: Response) => {
        try {
            await req.project.deleteOne()
            res.send('Proyecto elimiando con éxito')

        } catch (error) {

        }
    }

}