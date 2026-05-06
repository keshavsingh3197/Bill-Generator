import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../services/api.service';
import { BillTemplate } from '../../models/models';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatChipsModule, MatDialogModule,
    MatSnackBarModule, MatExpansionModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>style</mat-icon> Templates</h2>
        <button mat-raised-button color="primary" (click)="showCreate = !showCreate">
          <mat-icon>add</mat-icon> New Custom Template
        </button>
      </div>

      <!-- ── Template List ───────────────────────────── -->
      <div class="template-grid">
        <mat-card *ngFor="let t of templates" class="template-card" [class.built-in-card]="t.isBuiltIn">
          <mat-card-header>
            <mat-icon mat-card-avatar>{{t.isBuiltIn ? 'lock' : 'edit'}}</mat-icon>
            <mat-card-title>{{t.name}}</mat-card-title>
            <mat-card-subtitle>{{t.description}}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="template-meta">
              <span><mat-icon>store</mat-icon> {{t.shopName}}</span>
              <span><mat-icon>straighten</mat-icon> {{t.pageWidth}} × {{t.pageHeight}} pt</span>
              <span><mat-icon>format_size</mat-icon> {{t.baseFontSize}}pt base</span>
            </div>
            <div class="chips">
              <mat-chip [class.built-in-chip]="t.isBuiltIn">{{t.isBuiltIn ? 'Built-in' : 'Custom'}}</mat-chip>
              <mat-chip>{{t.dividerStyle}}</mat-chip>
              <mat-chip>{{t.headerStyle}} header</mat-chip>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button (click)="cloneTemplate(t)"><mat-icon>content_copy</mat-icon> Clone</button>
            <button mat-button color="warn" *ngIf="!t.isBuiltIn" (click)="deleteTemplate(t.name)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- ── Create / Edit Template Form ───────────── -->
      <mat-card *ngIf="showCreate" class="create-form">
        <mat-card-header>
          <mat-card-title>{{editing ? 'Edit' : 'Create'}} Custom Template</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-expansion-panel expanded>
            <mat-expansion-panel-header><mat-panel-title>Identity & Shop</mat-panel-title></mat-expansion-panel-header>
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>Template Name</mat-label><input matInput [(ngModel)]="form.name"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Description</mat-label><input matInput [(ngModel)]="form.description"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Shop Name</mat-label><input matInput [(ngModel)]="form.shopName"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Shop Address</mat-label><input matInput [(ngModel)]="form.shopAddress"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Shop Phone</mat-label><input matInput [(ngModel)]="form.shopPhone"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Tagline</mat-label><input matInput [(ngModel)]="form.shopTagline"/></mat-form-field>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header><mat-panel-title>Page & Typography</mat-panel-title></mat-expansion-panel-header>
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>Page Width (pt)</mat-label><input matInput type="number" [(ngModel)]="form.pageWidth"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Page Height (pt)</mat-label><input matInput type="number" [(ngModel)]="form.pageHeight"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Base Font Size</mat-label><input matInput type="number" [(ngModel)]="form.baseFontSize"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Header Font Size</mat-label><input matInput type="number" [(ngModel)]="form.headerFontSize"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Line Width (chars)</mat-label><input matInput type="number" [(ngModel)]="form.lineWidth"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Line Character</mat-label><input matInput maxlength="1" [(ngModel)]="form.lineChar"/></mat-form-field>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header><mat-panel-title>Style</mat-panel-title></mat-expansion-panel-header>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Divider Style</mat-label>
                <mat-select [(ngModel)]="form.dividerStyle">
                  <mat-option value="single">Single</mat-option>
                  <mat-option value="double">Double</mat-option>
                  <mat-option value="star">Star</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Header Style</mat-label>
                <mat-select [(ngModel)]="form.headerStyle">
                  <mat-option value="plain">Plain</mat-option>
                  <mat-option value="boxed">Boxed</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Currency Symbol</mat-label><input matInput [(ngModel)]="form.currencySymbol"/></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Thank You Message</mat-label><input matInput [(ngModel)]="form.thankYouMessage"/></mat-form-field>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header><mat-panel-title>Show / Hide Sections</mat-panel-title></mat-expansion-panel-header>
            <div class="toggles">
              <mat-slide-toggle [(ngModel)]="form.showSubtotal">Show Subtotal</mat-slide-toggle>
              <mat-slide-toggle [(ngModel)]="form.showCashLine">Show Cash Line</mat-slide-toggle>
              <mat-slide-toggle [(ngModel)]="form.showRemainingBalance">Show Remaining Balance</mat-slide-toggle>
              <mat-slide-toggle [(ngModel)]="form.showCashier">Show Cashier</mat-slide-toggle>
              <mat-slide-toggle [(ngModel)]="form.showPhone">Show Phone</mat-slide-toggle>
              <mat-slide-toggle [(ngModel)]="form.showTagline">Show Tagline</mat-slide-toggle>
              <mat-slide-toggle [(ngModel)]="form.showThankYouMessage">Show Thank You</mat-slide-toggle>
            </div>
          </mat-expansion-panel>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="saveTemplate()"><mat-icon>save</mat-icon> Save</button>
          <button mat-button (click)="showCreate = false; editing = false">Cancel</button>
        </mat-card-actions>
      </mat-card>

      <!-- Clone dialog prompt -->
      <mat-card *ngIf="cloningTemplate" class="create-form">
        <mat-card-header><mat-card-title>Clone "{{cloningTemplate.name}}"</mat-card-title></mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>New Template Name</mat-label>
            <input matInput [(ngModel)]="cloneName"/>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="confirmClone()"><mat-icon>content_copy</mat-icon> Clone</button>
          <button mat-button (click)="cloningTemplate = null">Cancel</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .template-card mat-icon[mat-card-avatar] { font-size: 36px; height: 36px; width: 36px; color: #3f51b5; }
    .built-in-card { border-left: 4px solid #3f51b5; }
    .template-meta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; font-size: 0.85rem; color: #555; }
    .template-meta span { display: flex; align-items: center; gap: 4px; }
    .template-meta mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .built-in-chip { background: #e8eaf6 !important; }
    .create-form { margin-top: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 16px 0; }
    .toggles { display: flex; flex-wrap: wrap; gap: 16px; padding: 16px 0; }
    mat-expansion-panel { margin-bottom: 8px; }
  `]
})
export class TemplatesComponent implements OnInit {
  templates: BillTemplate[] = [];
  showCreate = false;
  editing = false;
  cloningTemplate: BillTemplate | null = null;
  cloneName = '';

  form: BillTemplate = this.emptyForm();

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.api.getTemplates().subscribe(t => this.templates = t);
  }

  emptyForm(): BillTemplate {
    return {
      name: '', description: '', isBuiltIn: false,
      shopName: 'My Shop', shopAddress: '', shopPhone: '', shopTagline: '',
      pageWidth: 400, pageHeight: 1000,
      marginTop: 0, marginRight: 10, marginBottom: 10, marginLeft: 0,
      baseFontSize: 11, headerFontSize: 14, subHeaderFontSize: 12, footerFontSize: 10,
      lineWidth: 42, lineChar: '-',
      colQtyWidth: 4, colNameWidth: 20, colPriceWidth: 8, colAmountWidth: 10,
      currencySymbol: '₹', cultureName: 'en-IN',
      thankYouMessage: 'Thank You, Visit Again!', showThankYouMessage: true,
      dateFormat: 'dd/MM/yyyy', receiptLeftPadding: 55,
      dividerStyle: 'single', headerStyle: 'plain',
      showSubtotal: true, showCashLine: true, showRemainingBalance: true,
      showCashier: true, showPhone: false, showTagline: false
    };
  }

  saveTemplate() {
    if (!this.form.name) { this.snack.open('Template name is required.', 'OK', { duration: 3000 }); return; }
    this.api.createTemplate(this.form).subscribe({
      next: () => {
        this.snack.open(`Template '${this.form.name}' saved!`, 'OK', { duration: 3000 });
        this.showCreate = false;
        this.editing = false;
        this.form = this.emptyForm();
        this.loadTemplates();
      },
      error: e => this.snack.open(e.error?.message || 'Error saving template.', 'OK', { duration: 4000 })
    });
  }

  deleteTemplate(name: string) {
    if (!confirm(`Delete template '${name}'?`)) return;
    this.api.deleteTemplate(name).subscribe({
      next: () => {
        this.snack.open(`Deleted '${name}'.`, 'OK', { duration: 3000 });
        this.loadTemplates();
      }
    });
  }

  cloneTemplate(t: BillTemplate) {
    this.cloningTemplate = t;
    this.cloneName = t.name + '_copy';
  }

  confirmClone() {
    if (!this.cloningTemplate || !this.cloneName) return;
    this.api.cloneTemplate(this.cloningTemplate.name, this.cloneName).subscribe({
      next: cloned => {
        this.snack.open(`Cloned as '${cloned.name}'.`, 'OK', { duration: 3000 });
        this.cloningTemplate = null;
        this.loadTemplates();
      }
    });
  }
}
