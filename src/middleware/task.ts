import { type Request, type Response, type NextFunction, json } from 'express'
import Task, { ITask } from "../models/Task";

// 🔸 Extendemos la interfaz de Express para agregar una nueva propiedad al objeto `req`.
// Esto permite que TypeScript sepa que `req.project` es válido y tiene el tipo `IProject`.
// asi lo podemos usar en el controlador de tareas
declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

// 🔸 Middleware que valida si un proyecto con el ID recibido existe en la base de datos.
export async function taskExist(req: Request, res: Response, next: NextFunction) {
    try {
        // 🔹 Obtenemos el projectId de los parámetros de la URL.
        const { taskId } = req.params

        // 🔹 Buscamos el proyecto en la base de datos.
        const task = await Task.findById(taskId)

        // 🔹 Si no se encuentra el proyecto, devolvemos un error 404.
        if (!task) {
            const error = new Error('Tarea no encontrada')
            res.status(404).json({ error: error.message })
            return
        }

        // 🔹 Si el proyecto existe, lo agregamos a `req.project` para que esté disponible en la siguiente función.
        req.task = task

        // 🔹 Continuamos con el siguiente middleware o controlador.
        next()
        // return
    } catch (error) {
        // 🔹 Si ocurre algún error en la base de datos u otro, enviamos error 500.
        res.status(500).json({ error: 'Error al validar la tarea' })
    }
}


export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Acción no valida')
        res.status(400).json({ error: error.message })
        return
    }
    next()
}
export function hasAuthorization(req: Request, res: Response, next: NextFunction) {

    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Acción no valida, comunicate con el manager del proyecto')
        res.status(400).json({ error: error.message })
        return
    }
    next()
}