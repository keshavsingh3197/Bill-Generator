import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BillTemplate,
  BillRangeResult,
  GenerateBillRequest,
  GenerateRangeRequest,
  Item
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Templates ─────────────────────────────────────────────────────────────
  getTemplates(): Observable<BillTemplate[]> {
    return this.http.get<BillTemplate[]>(`${this.base}/api/templates`);
  }

  getTemplate(name: string): Observable<BillTemplate> {
    return this.http.get<BillTemplate>(`${this.base}/api/templates/${encodeURIComponent(name)}`);
  }

  createTemplate(t: BillTemplate): Observable<BillTemplate> {
    return this.http.post<BillTemplate>(`${this.base}/api/templates`, t);
  }

  deleteTemplate(name: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/templates/${encodeURIComponent(name)}`);
  }

  cloneTemplate(name: string, newName: string): Observable<BillTemplate> {
    return this.http.post<BillTemplate>(
      `${this.base}/api/templates/${encodeURIComponent(name)}/clone`,
      { newName }
    );
  }

  // ── Catalogue ─────────────────────────────────────────────────────────────
  getCatalogue(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.base}/api/catalogue`);
  }

  // ── Bills ────────────────────────────────────────────────────────────────
  generateBill(req: GenerateBillRequest): Observable<Blob> {
    return this.http.post(`${this.base}/api/bills/generate`, req, {
      responseType: 'blob'
    });
  }

  generateRange(req: GenerateRangeRequest): Observable<BillRangeResult[]> {
    return this.http.post<BillRangeResult[]>(`${this.base}/api/bills/generate-range`, req);
  }

  // ── AI ────────────────────────────────────────────────────────────────────
  getAiStatus(): Observable<{ available: boolean; provider?: string }> {
    return this.http.get<{ available: boolean; provider?: string }>(`${this.base}/api/ai/status`);
  }

  aiSuggestItems(request: string): Observable<Item[]> {
    return this.http.post<Item[]>(`${this.base}/api/ai/suggest-items`, { request });
  }

  aiGenerateTemplate(name: string, styleDescription: string): Observable<BillTemplate> {
    return this.http.post<BillTemplate>(`${this.base}/api/ai/generate-template`, {
      name,
      styleDescription
    });
  }
}
