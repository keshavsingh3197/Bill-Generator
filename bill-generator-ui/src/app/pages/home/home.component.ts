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

      <!-- ── Hero ─────────────────────────────────────────── -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-icon-wrap">
            <mat-icon class="hero-icon">receipt_long</mat-icon>
          </div>
          <h1 class="hero-title">Bill Generator</h1>
          <p class="hero-sub">
            Create professional PDF receipts for <strong>Bunty Di Hatti</strong>
            with AI-powered suggestions and custom templates.
          </p>
          <div class="hero-actions">
            <a mat-raised-button color="primary" routerLink="/generate" class="hero-btn primary-btn">
              <mat-icon>add_circle</mat-icon> Generate Bill
            </a>
            <a mat-stroked-button routerLink="/templates" class="hero-btn outline-btn">
              <mat-icon>style</mat-icon> Templates
            </a>
          </div>
        </div>
      </section>

      <!-- ── Feature Cards ─────────────────────────────────── -->
      <section class="features-section">
        <h2 class="section-title">What can you do?</h2>
        <div class="features-grid">

          <mat-card class="feature-card">
            <div class="card-accent indigo"></div>
            <mat-card-header>
              <div class="card-icon indigo-icon" mat-card-avatar><mat-icon>style</mat-icon></div>
              <mat-card-title>4 Predefined Templates</mat-card-title>
              <mat-card-subtitle>Ready-to-use receipt layouts</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Choose from Classic, Modern, Minimal, or Elegant receipt layouts — each fully customizable.</p>
              <div class="template-chips">
                <span class="tpl-chip" *ngFor="let t of templates">{{t}}</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/templates">Browse Templates →</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <div class="card-accent teal"></div>
            <mat-card-header>
              <div class="card-icon teal-icon" mat-card-avatar><mat-icon>tune</mat-icon></div>
              <mat-card-title>Custom Templates</mat-card-title>
              <mat-card-subtitle>Full design control</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Create, clone, and edit custom templates. Control fonts, widths, dividers, and every receipt section.</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/templates">Create Template →</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <div class="card-accent purple"></div>
            <mat-card-header>
              <div class="card-icon purple-icon" mat-card-avatar><mat-icon>psychology</mat-icon></div>
              <mat-card-title>AI Assistant</mat-card-title>
              <mat-card-subtitle>Powered by Google Gemini</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Let AI pick menu items from an order description, or generate a complete receipt template from a style prompt.</p>
              <div class="ai-status-chip" [class.online]="aiAvailable" [class.offline]="!aiAvailable">
                <mat-icon>{{ aiAvailable ? 'check_circle' : 'info' }}</mat-icon>
                <span>{{ aiAvailable ? 'AI Online (' + (aiProvider || 'Active') + ')' : 'Set GEMINI_API_KEY (free) on backend' }}</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/ai">Open AI Assistant →</a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <div class="card-accent amber"></div>
            <mat-card-header>
              <div class="card-icon amber-icon" mat-card-avatar><mat-icon>date_range</mat-icon></div>
              <mat-card-title>Batch Generation</mat-card-title>
              <mat-card-subtitle>Save hours of manual work</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Generate receipts for an entire date range in one click. Download all as individual PDFs instantly.</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" routerLink="/generate">Generate Range →</a>
            </mat-card-actions>
          </mat-card>

        </div>
      </section>

    </div>
  `,
  styles: [`
    .home-container { max-width: 1080px; margin: 0 auto; padding: 0 16px 48px; }

    /* Hero */
    .hero {
      position: relative;
      text-align: center;
      padding: 72px 16px 80px;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #ede9fe 0%, #e0f2fe 50%, #f0fdf4 100%);
      border-radius: 0 0 40px 40px;
      z-index: 0;
    }

    .hero-content { position: relative; z-index: 1; }

    .hero-icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 88px;
      height: 88px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 28px;
      box-shadow: 0 8px 32px rgba(79,70,229,0.35);
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .hero-icon { font-size: 44px; height: 44px; width: 44px; color: white; }

    .hero-title {
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #0891b2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      font-size: 1.1rem;
      color: #475569;
      max-width: 520px;
      margin: 0 auto 32px;
      line-height: 1.7;
    }

    .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

    .hero-btn {
      border-radius: 12px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      padding: 8px 24px !important;
      height: 48px !important;
    }

    .primary-btn {
      background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
      color: white !important;
      box-shadow: 0 4px 14px rgba(79,70,229,0.4) !important;
    }

    .outline-btn {
      border: 2px solid #4f46e5 !important;
      color: #4f46e5 !important;
      background: white !important;
    }

    /* Section */
    .features-section { padding: 48px 0 0; }
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 24px;
      letter-spacing: -0.02em;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    /* Feature Cards */
    .feature-card {
      position: relative;
      overflow: hidden;
      height: 100%;
    }

    .card-accent {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      border-radius: 16px 16px 0 0;
    }
    .card-accent.indigo { background: linear-gradient(90deg, #4f46e5, #818cf8); }
    .card-accent.teal   { background: linear-gradient(90deg, #0891b2, #06b6d4); }
    .card-accent.purple { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
    .card-accent.amber  { background: linear-gradient(90deg, #d97706, #fbbf24); }

    .card-icon {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 44px !important;
      height: 44px !important;
      border-radius: 12px !important;
      font-size: 0 !important;
    }
    .card-icon mat-icon { font-size: 22px; height: 22px; width: 22px; color: white; }

    .indigo-icon { background: linear-gradient(135deg, #4f46e5, #818cf8); }
    .teal-icon   { background: linear-gradient(135deg, #0891b2, #06b6d4); }
    .purple-icon { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
    .amber-icon  { background: linear-gradient(135deg, #d97706, #fbbf24); }

    mat-card-content p { color: #475569; line-height: 1.65; font-size: 0.9rem; }

    .template-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .tpl-chip {
      padding: 3px 10px;
      background: #ede9fe;
      color: #4f46e5;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      border: 1px solid #c7d2fe;
    }

    .ai-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 10px;
    }
    .ai-status-chip mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .ai-status-chip.online  { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .ai-status-chip.offline { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  `]
})
export class HomeComponent implements OnInit {
  templates = ['Classic', 'Modern', 'Minimal', 'Elegant'];
  aiAvailable = false;
  aiProvider: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAiStatus().subscribe({
      next: r => {
        this.aiAvailable = r.available;
        this.aiProvider = r.provider ?? null;
      }
    });
  }
}
