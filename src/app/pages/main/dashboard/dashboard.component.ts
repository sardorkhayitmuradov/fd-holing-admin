import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzResultComponent } from "ng-zorro-antd/result";

@Component({
  selector: 'fd-dashboard',
  standalone: true,
  imports: [CommonModule, NzButtonComponent, NzResultComponent, RouterLink, NzAlertModule, NzCalendarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public selectValue = new Date();
  
  public selectChange(date: any): void {
    this.selectValue = date;
  }
}
