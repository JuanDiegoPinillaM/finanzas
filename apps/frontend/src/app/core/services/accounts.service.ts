import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, AccountSummary, CreateAccount } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api/accounts';

  getByPeriod(period: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}?period=${period}`);
  }

  getSummary(period: string): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`${this.apiUrl}/summary?period=${period}`);
  }

  create(dto: CreateAccount): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, dto);
  }

  update(id: string, dto: Partial<CreateAccount>): Observable<Account> {
    return this.http.patch<Account>(`${this.apiUrl}/${id}`, dto);
  }

  generateRecurring(period: string): Observable<{ generated: number; message: string }> {
    return this.http.post<{ generated: number; message: string }>(`${this.apiUrl}/generate-recurring`, { period });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
