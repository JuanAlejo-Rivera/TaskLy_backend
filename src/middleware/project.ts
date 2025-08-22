import { type Request, type Response, type NextFunction, json } from 'express'
import Project, { IProject } from "../models/Project";

// 🔸 Extendemos la interfaz de Express para agregar una nueva propiedad al objeto `req`.
// Esto permite que TypeScript sepa que `req.project` es válido y tiene el tipo `IProject`.
// asi lo podemos usar en el controlador de tareas
declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

// 🔸 Middleware que valida si un proyecto con el ID recibido existe en la base de datos.
export async function ProjectExists(req: Request, res: Response, next: NextFunction) {
    try {
        // 🔹 Obtenemos el projectId de los parámetros de la URL.
        const { projectId } = req.params

        // 🔹 Buscamos el proyecto en la base de datos.
        const project = await Project.findById(projectId)

        // 🔹 Si no se encuentra el proyecto, devolvemos un error 404.
        if (!project) {
            const error = new Error('Proyecto no encontrado')
            res.status(404).json({ error: error.message })
            return
        }

        // 🔹 Si el proyecto existe, lo agregamos a `req.project` para que esté disponible en la siguiente función.
        req.project = project

        // 🔹 Continuamos con el siguiente middleware o controlador.
        next()
        return
    } catch (error) {
        // 🔹 Si ocurre algún error en la base de datos u otro, enviamos error 500.
        res.status(500).json({ error: 'Error al validar el proyecto' })
    }
}
