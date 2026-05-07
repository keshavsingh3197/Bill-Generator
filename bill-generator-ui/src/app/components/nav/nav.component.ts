import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar class="nav-toolbar">
      <a routerLink="/" class="brand">
        <div class="brand-icon">
          <mat-icon>receipt_long</mat-icon>
        </div>
        <span class="brand-name">Bill Generator</span>
      </a>

      <span class="spacer"></span>

      <!-- Desktop Nav -->
      <nav class="desktop-nav">
        <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
          <mat-icon>home</mat-icon> Home
        </a>
        <a mat-button routerLink="/generate" routerLinkActive="active-link" class="nav-link">
          <mat-icon>add_circle</mat-icon> Generate
        </a>
        <a mat-button routerLink="/templates" routerLinkActive="active-link" class="nav-link">
          <mat-icon>style</mat-icon> Templates
        </a>
        <a mat-button routerLink="/ai" routerLinkActive="active-link" class="nav-link ai-link">
          <mat-icon>psychology</mat-icon> AI
        </a>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button mat-icon-button class="mobile-menu-btn" (click)="menuOpen = !menuOpen; $event.stopPropagation()" aria-label="Menu">
        <mat-icon>{{ menuOpen ? 'close' : 'menu' }}</mat-icon>
      </button>
    </mat-toolbar>

    <!-- Mobile Dropdown -->
    <div class="mobile-nav" [class.open]="menuOpen" (click)="menuOpen = false">
      <a routerLink="/" routerLinkActive="mobile-active" [routerLinkActiveOptions]="{exact:true}" class="mobile-nav-item">
        <mat-icon>home</mat-icon> Home
      </a>
      <a routerLink="/generate" routerLinkActive="mobile-active" class="mobile-nav-item">
        <mat-icon>add_circle</mat-icon> Generate
      </a>
      <a routerLink="/templates" routerLinkActive="mobile-active" class="mobile-nav-item">
        <mat-icon>style</mat-icon> Templates
      </a>
      <a routerLink="/ai" routerLinkActive="mobile-active" class="mobile-nav-item">
        <mat-icon>psychology</mat-icon> AI Assistant
      </a>
    </div>
  `,
  styles: [`
    .nav-toolbar {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 60%, #1e1b4b 100%) !important;
      color: white !important;
      position: sticky;
      top: 0;
      z-index: 100;
      height: 64px;
      padding: 0 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
    }

    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      backdrop-filter: blur(4px);
    }

    .brand-icon mat-icon { font-size: 20px; height: 20px; width: 20px; }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .spacer { flex: 1; }

    .desktop-nav { display: flex; gap: 4px; }

    .nav-link {
      color: rgba(255,255,255,0.85) !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      font-size: 0.9rem !important;
      padding: 0 14px !important;
      transition: background 0.15s, color 0.15s !important;
    }

    .nav-link mat-icon {
      vertical-align: middle;
      margin-right: 4px;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .nav-link:hover {
      color: white !important;
      background: rgba(255,255,255,0.15) !important;
    }

    .active-link {
      color: white !important;
      background: rgba(255,255,255,0.2) !important;
    }

    .ai-link { color: #a5f3fc !important; }
    .ai-link.active-link { background: rgba(6, 182, 212, 0.25) !important; color: #67e8f9 !important; }

    .mobile-menu-btn {
      display: none !important;
      color: white !important;
    }

    .mobile-nav {
      display: none;
      flex-direction: column;
      background: #312e81;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.25s ease;
    }

    .mobile-nav.open { max-height: 300px; }

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.95rem;
      transition: background 0.15s;
    }

    .mobile-nav-item mat-icon { font-size: 20px; height: 20px; width: 20px; }
    .mobile-nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
    .mobile-active { background: rgba(255,255,255,0.15) !important; color: white !important; }

    @media (max-width: 640px) {
      .desktop-nav { display: none; }
      .mobile-menu-btn { display: flex !important; }
      .mobile-nav { display: flex; }
      .brand-name { font-size: 1rem; }
    }
  `]
})
export class NavComponent {
  menuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-nav') && this.menuOpen) {
      this.menuOpen = false;
    }
  }
}
