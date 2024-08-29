import type { Request, Response, NextFunction } from 'express'
import Task, { ITask } from '../models/Task'

declare global {
  namespace Express {
    interface Request {
      task: ITask
    }
  }
}

export async function TasksExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params
    const task = await Task.findById(taskId)
    if (!task) {
      const error = new Error('Tarea no encontrado')
      return res.status(404).json({ errror: error.message })
    }
    req.task = task
    next()
  } catch (error) {
    res.status(500).json({ error: 'Ha ocurrido un error', message: error.message})
  }
}

export function TaskBelongsToProject(req: Request, res: Response, next: NextFunction) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error('Accion no valida')
    return res.status(400).json({error: error.message})
  }
  next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error('Accion no valida')
    return res.status(400).json({error: error.message})
  }
  next()
}
