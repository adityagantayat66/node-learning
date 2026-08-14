import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { DashboardService } from "../../dashboard/dashboard.service";
import { EMPTY, mergeMap, of, take } from "rxjs";

export const resolver: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const _dashboardService = inject(DashboardService);
  switch (state.url) {
    case '/dashboard':
      return _dashboardService.getDashboardData()
        .pipe(
          take(1),
          mergeMap((res) => {
            if (res) {
              return of(res);
            }
            else {
              return EMPTY;
            }
          })
        )
    default:
      return EMPTY;

  }
}
