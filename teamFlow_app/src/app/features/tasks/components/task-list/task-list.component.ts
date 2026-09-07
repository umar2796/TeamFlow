import { Component, OnInit } from '@angular/core';
import { Task, TaskStatus } from '../../../../models/task.model';
import { TaskService } from '../../../../services/task.service';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-list',
  imports: [TaskCardComponent],
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
tasks!: Task[] 

constructor(private taskService: TaskService) {
}

ngOnInit() {
  this.tasks = this.taskService.getTasks(); 
}

onStatusChanged(event: { id: number; status: TaskStatus }){
  this.taskService.updateTask(event.id, { status: event.status });
  
}

onTaskDeleted(id: number){
  this.taskService.deleteTask(id);
}
}
