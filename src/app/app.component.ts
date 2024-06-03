import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressWidgetComponent } from './progress-widget/progress-widget.component';
import { Duration } from './custom-types'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProgressWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ZenithAscent';
  Duration = Duration
}
