import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>receipt_long</mat-icon>
      <span class="title">Bill Generator</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon> Home
      </a>
      <a mat-button routerLink="/generate" routerLinkActive="active-link">
        <mat-icon>add_circle</mat-icon> Generate
      </a>
      <a mat-button routerLink="/templates" routerLinkActive="active-link">
        <mat-icon>style</mat-icon> Templates
      </a>
      <a mat-button routerLink="/ai" routerLinkActive="active-link">
        <mat-icon>psychology</mat-icon> AI
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .title { margin-left: 8px; font-size: 1.2rem; font-weight: 600; }
    .spacer { flex: 1; }
    a mat-icon { vertical-align: middle; margin-right: 4px; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
  `]
})
export class NavComponent {}
