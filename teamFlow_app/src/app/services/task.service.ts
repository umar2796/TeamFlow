import { Injectable } from '@angular/core';
import { NewTaskInput, Task, TaskUpdate } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    {
      id: 1, title: 'Task 1', description: 'Description for Task 1',
      status: 'todo',
      priority: 1,
      createdAt: new Date()
    },
    {
      id: 2, title: 'Task 2', description: 'Description for Task 2',
      status: 'todo',
      priority: 1,
      createdAt: new Date()
    },
    {
      id: 3, title: 'Task 3', description: 'Description for Task 3',
      status: 'todo',
      priority: 1,
      createdAt: new Date()
    }
  ]

  getTasks(): Task[]{
    return this.tasks;
  }

  addTask(input: NewTaskInput): void{
    const newTask: Task = {
        ...input,
        id: Date.now(),
        createdAt: new Date()
    }
    this.tasks = [...this.tasks, newTask]
  }

  updateTask(id: number, changes: TaskUpdate): void{
  this.tasks = this.tasks.map(task =>
    task.id === id
      ? { ...task, ...changes }
      : task
  );
  }

  deleteTask(id: number): void{
    this.tasks = this.tasks.filter(task => task.id !== id);
  }
}