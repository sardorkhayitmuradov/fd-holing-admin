import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzResultComponent } from "ng-zorro-antd/result";


@Component({
  selector: 'fd-settings',
  standalone: true,
  imports: [NzButtonComponent, NzResultComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
