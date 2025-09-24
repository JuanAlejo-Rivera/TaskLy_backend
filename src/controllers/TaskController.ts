import { json, Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
    static createTask = async (req: Request, res: Response) => {

        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])

            res.send('Tarea creada con éxito')
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {

            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.json(tasks)

        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }
    //con este metodo puedo saber quien completo la tarea, y si esta pendiente o no
    static getTaskById = async (req: Request, res: Response) => {

        try {

            const task = await Task.findById(req.task.id)
                .populate({ path: 'completedBy.user', select: 'id name email' })
                .populate({ path: 'notes', populate: {path: 'createdBy', select: 'id name email'}}) //aqui haciendo populate de las notas, y dentro de las notas populando el campo createdBy

            res.json(task)

        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }
    static updateTask = async (req: Request, res: Response) => {

        try {

            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()

            res.send('Tarea actualizada con éxito')

        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }
    static deleteTask = async (req: Request, res: Response) => {

        try {
            // req.project.tasks  es un array de ObjectId
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])

            res.send('Tarea eliminada con éxito')
        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }

    static updateStatus = async (req: Request, res: Response) => {

        try {

            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data) // Agregamos el usuario que actualiza el estado de la tarea
            await req.task.save()
            res.send('Tarea actualizada con éxito')

        } catch (error) {
            res.status(500).json({ error: 'hubo un error' })
        }
    }


}

