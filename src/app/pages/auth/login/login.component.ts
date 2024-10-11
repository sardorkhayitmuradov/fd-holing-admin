import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { NzAlertComponent } from "ng-zorro-antd/alert";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { NzCheckboxGroupComponent } from "ng-zorro-antd/checkbox";
import { NzIconDirective } from "ng-zorro-antd/icon";
import { NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective } from "ng-zorro-antd/input";
import { NzModalComponent } from "ng-zorro-antd/modal";
import { NzResultComponent } from "ng-zorro-antd/result";
import { NzTagComponent } from "ng-zorro-antd/tag";
import { Subscription } from "rxjs";

import { AuthorizationService } from "@app/core/services/authorization.service";
import { StringOrJsonPipe } from "@shared/pipes/string-or-json.pipe";
import { FormGroupFrom } from "@shared/types/form-group.types";

export interface ILoginForm {
  username: string
  password: string
}

@Component({
  selector: 'cc-login',
  standalone: true,
  imports: [
    NzInputDirective,
    NzButtonComponent,
    NzTagComponent,
    NzIconDirective,
    FormsModule,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzInputGroupComponent,
    NzResultComponent,
    ReactiveFormsModule,
    NzAlertComponent,
    NzCheckboxGroupComponent,
    NzModalComponent,
    StringOrJsonPipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  public passwordVisible = false;
  public loading = false;
  public messages: string[] = [];

  public readonly fb = inject(FormBuilder);
  public readonly router = inject(Router);
  public readonly authService = inject(AuthorizationService);

  public loginForm = this.fb.group<FormGroupFrom<ILoginForm>>({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  })

  private loginSub: Subscription | undefined

  public login(): void {
    this.loginSub?.unsubscribe()
    this.loading = true
    this.loginSub = this.authService.login(this.loginForm.value as ILoginForm).subscribe({
      next: () => {
        void this.router.navigate(['/'])
        this.loading = false
      },
      error: (message) => {
        this.messages.push(message)
        this.loading = false
      }
    })
  }

  public ngOnDestroy(): void {
    this.loginSub?.unsubscribe()
  }

}