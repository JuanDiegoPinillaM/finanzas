import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateInvestment, Investment, InvestmentSummary, InvestmentType } from '../models/investment.model';

@Injectable({ providedIn: 'root' })
export class InvestmentsService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/investments';

  getByPeriod(period: string, type?: InvestmentType): Observable<Investment[]> {
    let url = `${this.apiUrl}?period=${period}`;
    if (type) url += `&type=${type}`;
    return this.http.get<Investment[]>(url);
  }

  getSummary(period: string): Observable<InvestmentSummary> {
    return this.http.get<InvestmentSummary>(`${this.apiUrl}/summary?period=${period}`);
  }

  create(dto: CreateInvestment): Observable<Investment> {
    return this.http.post<Investment>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateInvestment>): Observable<Investment> {
    return this.http.patch<Investment>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
