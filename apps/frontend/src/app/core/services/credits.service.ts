import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateCredit, Credit, CreditSummary } from '../models/credit.model';

@Injectable({ providedIn: 'root' })
export class CreditsService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/credits';

  getByPeriod(period: string): Observable<Credit[]> {
    return this.http.get<Credit[]>(`${this.apiUrl}?period=${period}`);
  }

  getSummary(period: string): Observable<CreditSummary> {
    return this.http.get<CreditSummary>(`${this.apiUrl}/summary?period=${period}`);
  }

  create(dto: CreateCredit): Observable<Credit> {
    return this.http.post<Credit>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateCredit>): Observable<Credit> {
    return this.http.patch<Credit>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
