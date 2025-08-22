import type { request, Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    //lo generics se usan para indicar que el tipo de dato que se va a recibir es un objeto que cumple con la interfaz INote
    //Request<{},{}, INote> indica que el request no tiene parametros en la url
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const { content } = req.body

        const note = new Note()
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id) //agrega la nota al array de notas de la tarea
        console.log(req)
        try {
            await Promise.allSettled([req.task.save(), note.save()]) //guarda la tarea y la nota al mismo tiempo
            res.send('Nota creada con éxito')
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la nota' })
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task.id })//llamamos las notas por el id de la tarea
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la nota' })

        }
    }
    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        const { noteId } = req.params
        const note = await Note.findById(noteId)

        if (!note) {
            const error = new Error('Nota no encontrada')
            res.status(404).json({ error: error.message })
            return
        }

        if (note.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error('No tienes permisos para eliminar esta nota')
            res.status(401).json({ error: error.message })
        }

        req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString()) //elimina la nota del array de notas de la tarea

        try {
            await Promise.allSettled([note.deleteOne(), req.task.save()]) //elimina la nota y guarda la tarea
            res.send('Nota eliminada con éxito')
            
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }

    }

}