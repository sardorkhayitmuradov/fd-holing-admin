import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import {
  NzBreadCrumbComponent,
  NzBreadCrumbModule,
} from "ng-zorro-antd/breadcrumb";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzSliderModule } from "ng-zorro-antd/slider";

@Component({
  selector: "fd-dashboard-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NzBreadCrumbComponent,
    NzLayoutModule,
    NzSliderModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    RouterOutlet,
  ],
  templateUrl: "./dashboard-layout.component.html",
  styleUrl: "./dashboard-layout.component.scss",
})
export class DashboardLayoutComponent {
  public isCollapsed = false;
}
