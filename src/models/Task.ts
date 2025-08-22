import mongoose, { Schema, Document, Types } from "mongoose";
import Note from "./Note";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const;

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus];


export interface ITask extends Document {
    name: string,
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completedBy: {
        user:Types.ObjectId,
        status: TaskStatus
    }[]
    notes:Types.ObjectId[]
}

export const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    description: {
        type: String,
        trim: true,
        require: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values(taskStatus), //solo permite los valores del enum
        default: taskStatus.PENDING // por defecto estara en pending
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus), //solo permite los valores del enum
                default: taskStatus.PENDING // por defecto estara en pending
            }
        }
    ],
    notes: [{
        type: Types.ObjectId,
        ref: 'Note'// es el Note de models/Note.ts
    }]
}, { timestamps: true })// con esto sabemos cuando se creo o actualizo una tarea

//Middleware de mongoose con esto podemos hacer algo antes de guardar el documento o despues de guardarlo

//con este codigo eliminamos las notas asociadas a la tarea cuando se elimina la tarea
TaskSchema.pre('deleteOne', {document: true}, async function(){ //debe ser asi ya que en las arrow functions no se puede acceder al this
    const taskId = this._id; //this hace referencia al documento que se esta eliminando
    if(!taskId) return;
    await Note.deleteMany({task: taskId}) //eliminamos todas las notas que esten asociadas a esta tarea
})

//de esta manera agregamos un modelo a mongoose
const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task