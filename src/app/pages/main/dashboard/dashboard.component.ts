import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzResultComponent } from "ng-zorro-antd/result";

@Component({
  selector: 'fd-dashboard',
  standalone: true,
  imports: [NzButtonComponent, NzResultComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
