import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

// PopulatedDoc se usa para indicar que el campo "tasks" puede contener
// referencias (ObjectId) que luego se pueden "popular" con los datos completos
// del documento referenciado (en este caso, documentos de tipo ITask).

export interface IProject extends Document {
    projectName: string,
    clientName: string,
    description: string
    tasks: PopulatedDoc<ITask & Document>[]
    manager: PopulatedDoc<IUser & Document> // Agregado para relacionar con el usuario que crea el proyecto
    team: PopulatedDoc<IUser & Document>[] // Agregado para relacionar con el equipo del proyecto
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        require: true,
        trim: true
    },
    clientName: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, { timestamps: true })// con esto sabemos cuand ose creo o actualizo una tarea

//middleware de mongoose, con esto podemos hacer algo antes de guardar el documento o despues de guardarlo

//este codigo borra las tareas y notas asociadas al proyecto cuando se elimina el proyecto
ProjectSchema.pre('deleteOne', { document: true }, async function () { //debe ser asi ya que en las arrow functions no se puede acceder al this
    const projectId = this._id; //this hace referencia al documento que se esta eliminando
    if (!projectId) return;

    const tasks = await Task.find({project: projectId})//traemos todas las tareas asociadas a este proyecto
    for(const task of tasks){
        await Note.deleteMany({task: task._id}) //eliminamos todas las notas que esten asociadas a esta tarea
    }
    await Task.deleteMany({ project: projectId }) //eliminamos todas las tareas que esten asociadas a este proyecto
})


//de esta manera agregamos un modelo a mongoose
const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project;