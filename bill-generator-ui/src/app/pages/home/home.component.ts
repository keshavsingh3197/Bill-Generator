import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="home-container">
      <div class="hero">
        <mat-icon class="hero-icon">receipt_long</mat-icon>
        <h1>Bill Generator</h1>
        <p>Generate professional PDF receipts for <strong>Bunty Di Hatti</strong></p>
        <div class="hero-actions">
          <a mat-raised-button color="primary" routerLink="/generate">
            <mat-icon>add_circle</mat-icon> Generate Bill
          </a>
          <a mat-stroked-button routerLink="/templates">
            <mat-icon>style</mat-icon> Manage Templates
          </a>
        </div>
      </div>

      <div class="features-grid">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">style</mat-icon>
            <mat-card-title>4 Predefined Templates</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Choose from Classic, Modern, Minimal, or Elegant receipt layouts.</p>
            <div class="chips">
              <mat-chip *ngFor="let t of templates">{{t}}</mat-chip>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/templates">Browse Templates</a>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>tune</mat-icon>
            <mat-card-title>Custom Templates</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Create, clone, and edit custom templates. Control every aspect of the receipt.</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/templates">Create Template</a>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>psychology</mat-icon>
            <mat-card-title>AI Assistant</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Use AI to suggest menu items from an order description, or generate a template from a style prompt.</p>
            <mat-chip [class.available]="aiAvailable" [class.unavailable]="!aiAvailable">
              AI: {{ aiAvailable ? 'Available' : 'Set OPENAI_API_KEY' }}
            </mat-chip>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/ai">Open AI Assistant</a>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>date_range</mat-icon>
            <mat-card-title>Batch Generation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Generate receipts for a full date range in one click. Downloads as individual PDFs.</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/generate">Generate Range</a>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .home-container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; }
    .hero { text-align: center; padding: 40px 0 32px; }
    .hero-icon { font-size: 64px; height: 64px; width: 64px; color: #3f51b5; }
    .hero h1 { font-size: 2.5rem; margin: 8px 0 4px; }
    .hero p { font-size: 1.1rem; color: #555; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
    .hero-actions a { font-size: 1rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    mat-card { height: 100%; }
    mat-icon[mat-card-avatar] { font-size: 40px; height: 40px; width: 40px; color: #3f51b5; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .available { background-color: #c8e6c9 !important; }
    .unavailable { background-color: #ffccbc !important; }
  `]
})
export class HomeComponent implements OnInit {
  templates = ['Classic', 'Modern', 'Minimal', 'Elegant'];
  aiAvailable = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAiStatus().subscribe({ next: r => this.aiAvailable = r.available });
  }
}
