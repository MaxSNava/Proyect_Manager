import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { ProjectExists } from '../middleware/project'
import { hasAuthorization, TasksExists } from '../middleware/task'
import { TaskBelongsToProject } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamController'
import { NoteController } from '../controllers/NoteController'

const router = Router()

// Middleware to authenticate all routes
router.use(authenticate)
router.param('projectId', ProjectExists)

//#region Routes_Projects
router.get('/',
  ProjectController.getAllProjects
)

router.get('/:id', 
  param('id').isMongoId().withMessage('El ID del proyecto es inválido'),
  handleInputErrors,
  ProjectController.getProjectById
)

router.post('/',
  body('projectName').notEmpty().withMessage('El nombre del proyecto es requerido'),
  body('clientName').notEmpty().withMessage('El nombre del cliente es requerido'),
  body('description').notEmpty().withMessage('La descripción del proyecto es requerida'),
  handleInputErrors,
  ProjectController.createProject
)

router.put('/:projectId', 
  param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
  body('projectName').notEmpty().withMessage('El nombre del proyecto es requerido'),
  body('clientName').notEmpty().withMessage('El nombre del cliente es requerido'),
  body('description').notEmpty().withMessage('La descripción del proyecto es requerida'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
)

router.delete('/:projectId', 
  param('projectId').isMongoId().withMessage('El ID del proyecto es inválido'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
)
//#endregion Routes_Projects

//#region Routes_Tasks

router.param('taskId', TasksExists)
router.param('taskId', TaskBelongsToProject)

router.post('/:projectId/tasks',
  hasAuthorization,
  body('name').notEmpty().withMessage('El nombre de la tarea es requerido'),
  body('description').notEmpty().withMessage('La descripción de la tarea es requerida'),
  handleInputErrors,
  TaskController.createTask
)

router.get('/:projectId/tasks',
  TaskController.getProjectTasks
)

router.get('/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('El ID de la tarea es inválido'),
  handleInputErrors,
  TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
  hasAuthorization,
  param('taskId').isMongoId().withMessage('El ID de la tarea es inválido'),
  body('name').notEmpty().withMessage('El nombre de la tarea es requerido'),
  body('description').notEmpty().withMessage('La descripción de la tarea es requerida'),
  handleInputErrors,
  TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
  hasAuthorization,
  param('taskId').isMongoId().withMessage('El ID de la tarea es inválido'),
  handleInputErrors,
  TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
  param('taskId').isMongoId().withMessage('El ID de la tarea es inválido'),
  body('status').notEmpty().withMessage('El estado de la tarea es requerido'),
  handleInputErrors,
  TaskController.updateStatus
)
//#endregion Routes_Tasks

//#region Routes_Team
router.post('/:projectId/team/find',
  body('email').isEmail().withMessage('El email es inválido'),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
)

router.post('/:projectId/team',
  body('id').isMongoId().withMessage('El ID del usuario es inválido'),
  handleInputErrors,
  TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
  param('userId').isMongoId().withMessage('El ID del usuario es inválido'),
  handleInputErrors,
  TeamMemberController.removeMemberById
)

router.get('/:projectId/team',
  TeamMemberController.getProyectTeam
)
//#endregion Routes_Team

//#region Routes_Notes
router.post('/:projectId/tasks/:taskId/notes',
  body('content').notEmpty().withMessage('El contenido de la nota es requerido'),
  handleInputErrors,
  NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
  NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('El ID de la nota es inválido'),
  handleInputErrors,
  NoteController.deleteNotes
)
//#endregion Routes_Notes

export default router