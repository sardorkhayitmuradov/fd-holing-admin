import { Component } from '@angular/core';

import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'cc-error-page',
  standalone: true,
  imports: [NzResultModule],
  templateUrl: "error-page.component.html"
})
export class ErrorPageComponent {
}