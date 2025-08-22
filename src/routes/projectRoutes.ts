import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { ProjectExists } from "../middleware/project";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";


const router = Router();

router.use(authenticate)// todas las rutas de este router pasaran por este middleware, para estar protegidas

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto es obligatoria'),

    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)

/** Routes for task */

router.param('projectId', ProjectExists)// todas las rutas que tengan projectId ejecutara ese middleware antes de ejecutar el controlador


router.put('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),

    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto es obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)


router.post('/:projectId/tasks',
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('el Nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),

    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks

)

router.param('taskId', taskExist)// todas las rutas que tengan taskId ejecutara ese middleware antes de ejecutar el controlador
router.param('taskId', taskBelongsToProject)// todas las rutas que tengan taskId ejecutara ese middleware antes de ejecutar el controlador

router.get('/:projectId/tasks/:taskId',

    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,

    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),

    handleInputErrors,

    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,

    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El estado de la tarea es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus

)
/** Routes for teams */
router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('E-mail no valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.addMemberById

)

router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberById

)

/** Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)
router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router;