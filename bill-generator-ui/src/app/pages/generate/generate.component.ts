import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { BillTemplate, Item } from '../../models/models';

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatTabsModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <h2><mat-icon>add_circle</mat-icon> Generate Bill</h2>

      <mat-tab-group>
        <!-- ── Single Bill ─────────────────────────────── -->
        <mat-tab label="Single Bill">
          <div class="tab-content">
            <mat-card>
              <mat-card-header><mat-card-title>Bill Details</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Template</mat-label>
                    <mat-select [(ngModel)]="singleReq.templateName">
                      <mat-option *ngFor="let t of templates" [value]="t.name">
                        {{t.name}} <span class="built-in" *ngIf="t.isBuiltIn">(built-in)</span>
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Bill Date</mat-label>
                    <input matInput [(ngModel)]="singleReq.billDate" type="date" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Bill Time</mat-label>
                    <input matInput [(ngModel)]="singleReq.billTime" type="time" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Cashier Name</mat-label>
                    <input matInput [(ngModel)]="singleReq.cashierName" />
                  </mat-form-field>
                </div>

                <h3>Items <button mat-icon-button color="primary" (click)="addItem()"><mat-icon>add</mat-icon></button></h3>
                <p class="hint">Leave items empty to auto-generate from the date.</p>

                <div class="ai-row">
                  <mat-form-field appearance="outline" class="ai-field">
                    <mat-label>Add items with AI</mat-label>
                    <input
                      matInput
                      [(ngModel)]="aiItemRequest"
                      placeholder="e.g. family dinner for 3 with starters and paneer curry" />
                  </mat-form-field>
                  <button
                    mat-stroked-button
                    color="accent"
                    (click)="addItemsUsingAi()"
                    [disabled]="!aiAvailable || suggestingItems || !aiItemRequest.trim()">
                    <mat-spinner diameter="20" *ngIf="suggestingItems"></mat-spinner>
                    <mat-icon *ngIf="!suggestingItems">auto_awesome</mat-icon>
                    {{ suggestingItems ? 'Adding...' : 'Add with AI' }}
                  </button>
                </div>
                <p class="hint" *ngIf="!aiAvailable">
                  Set <code>GEMINI_API_KEY</code> (free) or <code>OPENAI_API_KEY</code> on the backend to enable AI item suggestions.
                </p>

                <table mat-table [dataSource]="items" *ngIf="items.length" class="items-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Item</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" class="cell-field">
                        <input matInput [(ngModel)]="items[i].name" placeholder="Name" />
                      </mat-form-field>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="qty">
                    <th mat-header-cell *matHeaderCellDef>Qty</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" class="cell-field cell-small">
                        <input matInput type="number" [(ngModel)]="items[i].quantity" min="1" />
                      </mat-form-field>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef>Price (₹)</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" class="cell-field cell-small">
                        <input matInput type="number" [(ngModel)]="items[i].price" min="0" />
                      </mat-form-field>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let item">₹ {{item.quantity * item.price | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <button mat-icon-button color="warn" (click)="removeItem(i)"><mat-icon>delete</mat-icon></button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="itemCols"></tr>
                  <tr mat-row *matRowDef="let row; columns: itemCols;"></tr>
                </table>

                <div class="total-row" *ngIf="items.length">
                  <strong>Total: ₹ {{getTotal() | number:'1.2-2'}}</strong>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="generateSingle()" [disabled]="generating">
                  <mat-spinner diameter="20" *ngIf="generating"></mat-spinner>
                  <mat-icon *ngIf="!generating">picture_as_pdf</mat-icon>
                  {{ generating ? 'Generating...' : 'Generate PDF' }}
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ── Date Range ──────────────────────────────── -->
        <mat-tab label="Date Range Batch">
          <div class="tab-content">
            <mat-card>
              <mat-card-header><mat-card-title>Batch Generation</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Template</mat-label>
                    <mat-select [(ngModel)]="rangeReq.templateName">
                      <mat-option *ngFor="let t of templates" [value]="t.name">{{t.name}}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Start Date</mat-label>
                    <input matInput [(ngModel)]="rangeReq.startDate" type="date" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>End Date</mat-label>
                    <input matInput [(ngModel)]="rangeReq.endDate" type="date" />
                  </mat-form-field>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="generateRange()" [disabled]="generatingRange">
                  <mat-spinner diameter="20" *ngIf="generatingRange"></mat-spinner>
                  <mat-icon *ngIf="!generatingRange">date_range</mat-icon>
                  {{ generatingRange ? 'Generating...' : 'Generate All' }}
                </button>
              </mat-card-actions>
            </mat-card>

            <div *ngIf="rangeResults.length" class="range-results">
              <h3>Generated {{ rangeResults.length }} bill(s)</h3>
              <mat-card *ngFor="let r of rangeResults" class="result-card">
                <mat-card-content class="result-row">
                  <span>{{r.date}}</span>
                  <strong>₹ {{r.total | number:'1.2-2'}}</strong>
                  <button mat-stroked-button (click)="downloadPdf(r.pdfBase64, r.fileName)">
                    <mat-icon>download</mat-icon> {{r.fileName}}
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
    h2 { display: flex; align-items: center; gap: 8px; }
    .tab-content { padding: 20px 0; }
    .form-row { display: flex; flex-wrap: wrap; gap: 16px; }
    .form-row mat-form-field { flex: 1; min-width: 180px; }
    .items-table { width: 100%; margin: 12px 0; }
    .ai-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin: 8px 0 12px; }
    .ai-field { flex: 1; min-width: 260px; }
    .cell-field { width: 100%; }
    .cell-small { max-width: 90px; }
    .total-row { text-align: right; padding: 8px; font-size: 1.1rem; }
    .range-results { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
    .result-card mat-card-content { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 12px; }
    .hint { color: #888; font-size: 0.85rem; margin: 0 0 8px; }
    .built-in { font-size: 0.75rem; color: #888; }
    button mat-spinner { display: inline-block; margin-right: 6px; }
  `]
})
export class GenerateComponent implements OnInit {
  templates: BillTemplate[] = [];
  items: Item[] = [];
  itemCols = ['name', 'qty', 'price', 'amount', 'action'];
  generating = false;
  generatingRange = false;
  aiAvailable = false;
  suggestingItems = false;
  aiItemRequest = '';
  rangeResults: any[] = [];

  today = new Date().toISOString().split('T')[0];
  nowTime = new Date().toTimeString().substring(0, 5);

  singleReq = {
    templateName: 'Classic',
    billDate: this.today,
    billTime: this.nowTime,
    cashierName: ''
  };

  rangeReq = {
    templateName: 'Classic',
    startDate: '2026-03-24',
    endDate: '2026-03-31'
  };

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.getTemplates().subscribe(t => this.templates = t);
    this.api.getAiStatus().subscribe({
      next: r => this.aiAvailable = r.available,
      error: () => this.aiAvailable = false
    });
  }

  addItem() {
    this.items.push({ name: '', quantity: 1, price: 0 });
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
  }

  getTotal(): number {
    return this.items.reduce((s, i) => s + i.quantity * i.price, 0);
  }

  generateSingle() {
    this.generating = true;
    const req = {
      ...this.singleReq,
      items: this.items.length ? this.items : undefined
    };
    this.api.generateBill(req).subscribe({
      next: blob => {
        this.generating = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${this.singleReq.billDate.replace(/-/g, '')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.snack.open('PDF downloaded!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.generating = false;
        this.snack.open('Failed to generate bill. Is the backend running?', 'OK', { duration: 5000 });
      }
    });
  }

  addItemsUsingAi() {
    const request = this.aiItemRequest.trim();
    if (!request || !this.aiAvailable) return;

    this.suggestingItems = true;
    this.api.aiSuggestItems(request).subscribe({
      next: response => {
        this.suggestingItems = false;
        const items = response.items ?? [];
        if (!items.length) {
          this.snack.open('AI did not return any items.', 'OK', { duration: 3000 });
          return;
        }

        this.items = [...this.items, ...items.map(i => ({ ...i }))];
        this.aiItemRequest = '';
        const via = response.source === 'fallback' ? 'fallback' : 'AI';
        const note = response.note ? ` ${response.note}` : '';
        this.snack.open(`Added ${items.length} item(s) via ${via}.${note}`, 'OK', { duration: 3500 });
      },
      error: () => {
        this.suggestingItems = false;
        this.snack.open('AI request failed.', 'OK', { duration: 3000 });
      }
    });
  }

  generateRange() {
    this.generatingRange = true;
    this.rangeResults = [];
    this.api.generateRange(this.rangeReq).subscribe({
      next: results => {
        this.generatingRange = false;
        this.rangeResults = results;
        this.snack.open(`Generated ${results.length} bills!`, 'OK', { duration: 3000 });
      },
      error: () => {
        this.generatingRange = false;
        this.snack.open('Failed to generate bills. Is the backend running?', 'OK', { duration: 5000 });
      }
    });
  }

  downloadPdf(base64: string, fileName: string) {
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  }
}
