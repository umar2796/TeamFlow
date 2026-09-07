import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Task } from './models/task.model';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  taskArray : Task[] = []
  
  constructor(private taskService: TaskService) {
    this.taskArray = this.taskService.getTasks();
  }
}
