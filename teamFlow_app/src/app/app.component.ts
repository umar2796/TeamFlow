import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Task } from './core/models/task.model';
import { TaskService } from './services/task.service';
import { TaskListComponent } from './features/tasks/components/task-list/task-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TaskListComponent],
  providers: [TaskListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  taskArray : Task[] = []
  
  constructor(private taskService: TaskService) {
    this.taskArray = this.taskService.getTasks();
  }
}
