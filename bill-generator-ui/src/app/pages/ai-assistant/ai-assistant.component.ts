import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../services/api.service';
import { Item, BillTemplate } from '../../models/models';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatDividerModule, MatTabsModule
  ],
  template: `
    <div class="page-container">

      <!-- ── Header ─────────────────────────────── -->
      <div class="page-header">
        <div class="header-left">
          <div class="page-icon"><mat-icon>psychology</mat-icon></div>
          <div>
            <h2 class="page-title">AI Assistant</h2>
            <p class="page-sub">Powered by Google Gemini — free to use</p>
          </div>
        </div>
        <div class="status-badge" [class.online]="aiAvailable" [class.offline]="!aiAvailable">
          <mat-icon>{{ aiAvailable ? 'check_circle' : 'error_outline' }}</mat-icon>
          <span>{{ aiAvailable ? (aiProvider || 'AI') + ' Online' : 'AI Offline' }}</span>
        </div>
      </div>

      <!-- ── Setup Banner ───────────────────────── -->
      <div class="setup-banner" *ngIf="!aiAvailable">
        <mat-icon>tips_and_updates</mat-icon>
        <div class="setup-text">
          <strong>Enable AI features for free</strong>
          <p>
            Get a free API key from
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>
            (no credit card required), then set <code>GEMINI_API_KEY=&lt;your-key&gt;</code> as an environment variable on the backend.
            Alternatively, set <code>OPENAI_API_KEY</code> if you have an OpenAI account.
          </p>
        </div>
      </div>

      <mat-tab-group class="ai-tabs">

        <!-- ── Item Suggestion ─────────────────────── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">auto_awesome</mat-icon> Item Suggestion
          </ng-template>
          <div class="tab-content">
            <mat-card class="ai-card">
              <mat-card-header>
                <mat-card-title>AI Item Suggestion</mat-card-title>
                <mat-card-subtitle>Describe an order — AI picks items from the catalogue</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Describe the order</mat-label>
                  <textarea matInput rows="3" [(ngModel)]="itemRequest"
                    placeholder="e.g. a vegetarian party of 4 with some snacks and curries"></textarea>
                  <mat-hint>Be as descriptive as you like — AI will match items from the menu catalogue</mat-hint>
                </mat-form-field>

                <button mat-raised-button color="primary" class="action-btn"
                  (click)="suggestItems()" [disabled]="!aiAvailable || suggestingItems || !itemRequest.trim()">
                  <mat-spinner diameter="18" *ngIf="suggestingItems"></mat-spinner>
                  <mat-icon *ngIf="!suggestingItems">auto_awesome</mat-icon>
                  {{ suggestingItems ? 'Thinking...' : 'Suggest Items' }}
                </button>

                <div *ngIf="suggestedItems.length" class="results">
                  <mat-divider></mat-divider>
                  <h3 class="results-title">
                    <mat-icon>check_circle</mat-icon> Suggested Items ({{suggestedItems.length}})
                  </h3>
                  <div class="results-table-wrap">
                    <table mat-table [dataSource]="suggestedItems" class="items-table">
                      <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Item</th>
                        <td mat-cell *matCellDef="let item">{{item.name}}</td>
                      </ng-container>
                      <ng-container matColumnDef="qty">
                        <th mat-header-cell *matHeaderCellDef>Qty</th>
                        <td mat-cell *matCellDef="let item">{{item.quantity}}</td>
                      </ng-container>
                      <ng-container matColumnDef="price">
                        <th mat-header-cell *matHeaderCellDef>Price</th>
                        <td mat-cell *matCellDef="let item">₹ {{item.price | number:'1.2-2'}}</td>
                      </ng-container>
                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount</th>
                        <td mat-cell *matCellDef="let item" class="amount-cell">
                          ₹ {{item.quantity * item.price | number:'1.2-2'}}
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="itemCols"></tr>
                      <tr mat-row *matRowDef="let row; columns: itemCols;"></tr>
                    </table>
                  </div>
                  <div class="total-row">
                    <span class="total-label">Total</span>
                    <span class="total-amount">₹ {{suggestedTotal | number:'1.2-2'}}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ── Template Generation ────────────────── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">palette</mat-icon> Template Generator
          </ng-template>
          <div class="tab-content">
            <mat-card class="ai-card">
              <mat-card-header>
                <mat-card-title>AI Template Generator</mat-card-title>
                <mat-card-subtitle>Describe a receipt style — AI creates a custom template</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Template Name</mat-label>
                  <input matInput [(ngModel)]="templateName" placeholder="e.g. MyElegantTemplate"/>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Style Description</mat-label>
                  <textarea matInput rows="4" [(ngModel)]="templateDesc"
                    placeholder="e.g. wide page, star dividers, elegant look for a fine-dining restaurant in Mumbai, show tagline and phone"></textarea>
                  <mat-hint>Describe fonts, page size, divider style, visible sections, and the shop vibe</mat-hint>
                </mat-form-field>

                <button mat-raised-button color="accent" class="action-btn"
                  (click)="generateTemplate()" [disabled]="!aiAvailable || generatingTemplate">
                  <mat-spinner diameter="18" *ngIf="generatingTemplate"></mat-spinner>
                  <mat-icon *ngIf="!generatingTemplate">auto_awesome</mat-icon>
                  {{ generatingTemplate ? 'Generating...' : 'Generate Template' }}
                </button>

                <div *ngIf="generatedTemplate" class="results">
                  <mat-divider></mat-divider>
                  <h3 class="results-title">
                    <mat-icon>check_circle</mat-icon> Generated: "{{generatedTemplate.name}}"
                  </h3>
                  <div class="template-preview-grid">
                    <div class="preview-item">
                      <span class="preview-label">Shop</span>
                      <span class="preview-value">{{generatedTemplate.shopName}}</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">Page size</span>
                      <span class="preview-value">{{generatedTemplate.pageWidth}} × {{generatedTemplate.pageHeight}} pt</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">Header</span>
                      <span class="preview-value">{{generatedTemplate.headerStyle}}</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">Divider</span>
                      <span class="preview-value">{{generatedTemplate.dividerStyle}} ({{generatedTemplate.lineChar}})</span>
                    </div>
                    <div class="preview-item full">
                      <span class="preview-label">Thank-you</span>
                      <span class="preview-value">{{generatedTemplate.thankYouMessage}}</span>
                    </div>
                  </div>
                  <p class="saved-notice"><mat-icon>check</mat-icon> Template saved — available in the Templates page.</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 32px 16px 48px; }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .page-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(124,58,237,0.3);
    }
    .page-icon mat-icon { color: white; font-size: 26px; height: 26px; width: 26px; }
    .page-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 2px; color: #1e293b; }
    .page-sub { margin: 0; color: #64748b; font-size: 0.9rem; }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .status-badge mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .status-badge.online  { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .status-badge.offline { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }

    /* Setup Banner */
    .setup-banner {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: linear-gradient(135deg, #fef3c7, #fffbeb);
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .setup-banner > mat-icon { color: #d97706; margin-top: 2px; flex-shrink: 0; }
    .setup-text { font-size: 0.88rem; color: #78350f; line-height: 1.6; }
    .setup-text strong { font-size: 0.95rem; display: block; margin-bottom: 4px; color: #92400e; }
    .setup-text p { margin: 0; }
    .setup-text a { color: #b45309; font-weight: 600; }
    .setup-text code {
      background: rgba(0,0,0,0.07);
      padding: 1px 5px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.85em;
    }

    /* Tabs */
    .ai-tabs { margin-top: 0; }
    .tab-icon { font-size: 18px; height: 18px; width: 18px; margin-right: 6px; vertical-align: middle; }
    .tab-content { padding: 24px 0 0; }

    /* Cards */
    .ai-card { padding-bottom: 8px; }

    .full-width { width: 100%; }

    .action-btn {
      border-radius: 10px !important;
      font-weight: 600 !important;
      height: 44px !important;
      margin-top: 8px;
    }
    .action-btn mat-spinner { display: inline-block; margin-right: 8px; }

    /* Results */
    .results { margin-top: 20px; }
    .results-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 16px 0 12px;
    }
    .results-title mat-icon { color: #10b981; font-size: 20px; height: 20px; width: 20px; }

    .results-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
    .items-table { width: 100%; }
    .amount-cell { font-weight: 600; color: #4f46e5; }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e2e8f0;
      border-top: none;
    }
    .total-label { font-size: 0.9rem; color: #64748b; font-weight: 500; }
    .total-amount { font-size: 1.15rem; font-weight: 700; color: #4f46e5; }

    /* Template Preview */
    .template-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .preview-item { display: flex; flex-direction: column; gap: 2px; }
    .preview-item.full { grid-column: 1 / -1; }
    .preview-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
    .preview-value { font-size: 0.9rem; color: #1e293b; font-weight: 500; }

    .saved-notice {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #065f46;
      font-weight: 600;
      font-size: 0.9rem;
      margin: 12px 0 0;
    }
    .saved-notice mat-icon { color: #10b981; font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class AiAssistantComponent implements OnInit {
  aiAvailable = false;
  aiProvider: string | null = null;
  itemRequest = '';
  suggestedItems: Item[] = [];
  suggestedTotal = 0;
  suggestingItems = false;
  itemCols = ['name', 'qty', 'price', 'amount'];

  templateName = '';
  templateDesc = '';
  generatedTemplate: BillTemplate | null = null;
  generatingTemplate = false;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.getAiStatus().subscribe({
      next: r => {
        this.aiAvailable = r.available;
        this.aiProvider = r.provider ?? null;
      }
    });
  }

  suggestItems() {
    this.suggestingItems = true;
    this.api.aiSuggestItems(this.itemRequest).subscribe({
      next: items => {
        this.suggestingItems = false;
        this.suggestedItems = items;
        this.suggestedTotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
      },
      error: () => {
        this.suggestingItems = false;
        this.snack.open('AI request failed.', 'OK', { duration: 3000 });
      }
    });
  }

  generateTemplate() {
    if (!this.templateName || !this.templateDesc) {
      this.snack.open('Please enter both a name and a description.', 'OK', { duration: 3000 }); return;
    }
    this.generatingTemplate = true;
    this.api.aiGenerateTemplate(this.templateName, this.templateDesc).subscribe({
      next: t => {
        this.generatingTemplate = false;
        this.generatedTemplate = t;
        this.snack.open(`Template '${t.name}' generated!`, 'OK', { duration: 3000 });
      },
      error: () => {
        this.generatingTemplate = false;
        this.snack.open('AI request failed.', 'OK', { duration: 3000 });
      }
    });
  }
}
