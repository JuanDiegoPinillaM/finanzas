import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { signal } from '@angular/core';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);

  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumbs(this.router.routerState.snapshot.root)),
      )
      .subscribe((breadcrumbs) => this.breadcrumbs.set(breadcrumbs));
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeUrl = child.url.map((segment) => segment.path).join('/');
      const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;

      const label = child.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url: nextUrl });
      }

      return this.buildBreadcrumbs(child, nextUrl, breadcrumbs);
    }

    return breadcrumbs;
  }
}
