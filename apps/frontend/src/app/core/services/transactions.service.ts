import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateTransaction,
  Transaction,
  TransactionSummary,
  TransactionType,
} from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly apiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient) {}

  getByPeriod(period: string, type?: TransactionType): Observable<Transaction[]> {
    let url = `${this.apiUrl}?period=${period}`;
    if (type) url += `&type=${type}`;
    return this.http.get<Transaction[]>(url);
  }

  getSummary(period: string): Observable<TransactionSummary> {
    return this.http.get<TransactionSummary>(`${this.apiUrl}/summary?period=${period}`);
  }

  create(dto: CreateTransaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateTransaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, dto);
  }

  togglePaid(id: string): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}/toggle-paid`, {});
  }

  generateRecurring(period: string): Observable<{ generated: number; message: string }> {
    return this.http.post<{ generated: number; message: string }>(`${this.apiUrl}/generate-recurring`, { period });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
