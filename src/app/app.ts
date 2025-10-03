import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  standalone: true, // important for standalone components
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']  // fix typo: styleUrl -> styleUrls
})
export class App {
  protected readonly title = signal('slotify');
}
