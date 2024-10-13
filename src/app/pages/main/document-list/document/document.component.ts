import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzResultComponent } from "ng-zorro-antd/result";


@Component({
  selector: 'fd-document',
  standalone: true,
  imports: [NzButtonComponent, NzResultComponent, RouterLink],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent {

}
