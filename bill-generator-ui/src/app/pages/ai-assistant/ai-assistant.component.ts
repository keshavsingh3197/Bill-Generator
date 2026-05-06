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
import { MatChipsModule } from '@angular/material/chips';
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
    MatChipsModule, MatDividerModule, MatTabsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>psychology</mat-icon> AI Assistant</h2>
        <mat-chip [class.available]="aiAvailable" [class.unavailable]="!aiAvailable">
          {{aiAvailable ? '✓ AI Online' : '✗ Set OPENAI_API_KEY on backend'}}
        </mat-chip>
      </div>

      <p class="info" *ngIf="!aiAvailable">
        AI features require the <code>OPENAI_API_KEY</code> environment variable to be set on the backend server.
        Set it in your Render dashboard (or locally via <code>export OPENAI_API_KEY=sk-...</code>).
      </p>

      <mat-tab-group>
        <!-- ── Item Suggestion ─────────────────────── -->
        <mat-tab label="Item Suggestion">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>AI Item Suggestion</mat-card-title>
                <mat-card-subtitle>Describe an order – AI picks items from the catalogue</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Describe the order</mat-label>
                  <textarea matInput rows="3" [(ngModel)]="itemRequest"
                    placeholder="e.g. a vegetarian party of 4 with some snacks and curries"></textarea>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="suggestItems()" [disabled]="!aiAvailable || suggestingItems">
                  <mat-spinner diameter="20" *ngIf="suggestingItems"></mat-spinner>
                  <mat-icon *ngIf="!suggestingItems">auto_awesome</mat-icon>
                  {{ suggestingItems ? 'Thinking...' : 'Suggest Items' }}
                </button>

                <div *ngIf="suggestedItems.length" class="results">
                  <mat-divider></mat-divider>
                  <h3>Suggested Items</h3>
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
                      <td mat-cell *matCellDef="let item">₹ {{item.quantity * item.price | number:'1.2-2'}}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="itemCols"></tr>
                    <tr mat-row *matRowDef="let row; columns: itemCols;"></tr>
                  </table>

                  <div class="total-row">
                    <strong>Total: ₹ {{suggestedTotal | number:'1.2-2'}}</strong>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ── Template Generation ────────────────── -->
        <mat-tab label="Template Generator">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>AI Template Generator</mat-card-title>
                <mat-card-subtitle>Describe a receipt style – AI creates a custom template</mat-card-subtitle>
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
                </mat-form-field>

                <button mat-raised-button color="accent" (click)="generateTemplate()" [disabled]="!aiAvailable || generatingTemplate">
                  <mat-spinner diameter="20" *ngIf="generatingTemplate"></mat-spinner>
                  <mat-icon *ngIf="!generatingTemplate">auto_awesome</mat-icon>
                  {{ generatingTemplate ? 'Generating...' : 'Generate Template' }}
                </button>

                <div *ngIf="generatedTemplate" class="results">
                  <mat-divider></mat-divider>
                  <h3>Generated Template: "{{generatedTemplate.name}}"</h3>
                  <div class="template-preview">
                    <div><strong>Shop:</strong> {{generatedTemplate.shopName}}</div>
                    <div><strong>Page:</strong> {{generatedTemplate.pageWidth}} × {{generatedTemplate.pageHeight}} pt</div>
                    <div><strong>Header:</strong> {{generatedTemplate.headerStyle}}</div>
                    <div><strong>Divider:</strong> {{generatedTemplate.dividerStyle}} ({{generatedTemplate.lineChar}})</div>
                    <div><strong>Thank-you:</strong> {{generatedTemplate.thankYouMessage}}</div>
                  </div>
                  <p class="saved-notice">✓ Template saved and available in the Templates page.</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
    h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .available { background-color: #c8e6c9 !important; }
    .unavailable { background-color: #ffccbc !important; }
    .info { color: #888; margin: 0 0 16px; background: #fff8e1; padding: 12px; border-radius: 4px; }
    .tab-content { padding: 20px 0; }
    .full-width { width: 100%; }
    .results { margin-top: 16px; }
    .items-table { width: 100%; margin: 12px 0; }
    .total-row { text-align: right; padding: 8px; font-size: 1.1rem; }
    .template-preview { background: #f5f5f5; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
    .saved-notice { color: #388e3c; font-weight: 500; margin-top: 10px; }
    button mat-spinner { display: inline-block; margin-right: 6px; }
  `]
})
export class AiAssistantComponent implements OnInit {
  aiAvailable = false;
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
    this.api.getAiStatus().subscribe({ next: r => this.aiAvailable = r.available });
  }

  suggestItems() {
    if (!this.itemRequest) return;
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
