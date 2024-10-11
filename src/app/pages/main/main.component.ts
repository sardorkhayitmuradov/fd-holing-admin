import { Component } from '@angular/core';

@Component({
  selector: 'fd-main',
  template: `
    <fd-dashboard-layout></fd-dashboard-layout>
  `,
  styles: `
    :host {
      height: 100%;
    }
  `,
})
export class MainComponent {

}
