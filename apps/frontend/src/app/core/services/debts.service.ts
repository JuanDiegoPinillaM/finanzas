import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDebt, Debt, DebtSummary, DebtType } from '../models/debt.model';

@Injectable({ providedIn: 'root' })
export class DebtsService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/debts';

  getByPeriod(period: string, type?: DebtType): Observable<Debt[]> {
    let url = `${this.apiUrl}?period=${period}`;
    if (type) url += `&type=${type}`;
    return this.http.get<Debt[]>(url);
  }

  getSummary(period: string): Observable<DebtSummary> {
    return this.http.get<DebtSummary>(`${this.apiUrl}/summary?period=${period}`);
  }

  create(dto: CreateDebt): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateDebt>): Observable<Debt> {
    return this.http.patch<Debt>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
