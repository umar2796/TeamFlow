import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task, TaskStatus } from '../../../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input({required: true}) task! : Task;
  @Output() statusChanged = new EventEmitter<{ id: number; status: TaskStatus }>();
  @Output() deleted = new EventEmitter<number>();

  onMarkDone(){
    this.statusChanged.emit({id: this.task.id, status: 'done'});
  }

  onDelete(){
    this.deleted.emit(this.task.id);
  }
}
