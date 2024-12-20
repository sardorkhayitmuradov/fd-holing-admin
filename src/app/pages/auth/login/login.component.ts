import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxGroupComponent } from 'ng-zorro-antd/checkbox';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import {
  NzInputDirective,
  NzInputGroupComponent,
  NzInputGroupWhitSuffixOrPrefixDirective,
} from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalComponent } from 'ng-zorro-antd/modal';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzTagComponent } from 'ng-zorro-antd/tag';

import { AuthService } from '@core/services/requests/auth.service';
import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';
import { StringOrJsonPipe } from '@shared/pipes/string-or-json.pipe';
import { FormGroupFrom } from '@shared/types/form-group.types';
import { IResponse } from '@core/interfaces/reponse.interface';
import { ILoginResponse } from '@core/interfaces/auth/login-response.interface';
import { ResponseStatusesEnum } from '@core/enums/response-statuses.enum';

export interface ILoginForm {
  username: string;
  password: string;
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
  styleUrl: './login.component.scss',
})
export class LoginComponent extends UnsubscribeDirective implements OnInit {
  public passwordVisible = false;
  public loading = false;

  public readonly fb = inject(FormBuilder);
  public readonly router = inject(Router);
  public readonly message = inject(NzMessageService);
  public readonly authService = inject(AuthService);
  public readonly cdr = inject(ChangeDetectorRef);

  public loginForm = this.fb.group<FormGroupFrom<ILoginForm>>({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  public constructor() {
    super();
  }

  public ngOnInit(): void {
    return;
  }

  public login(): void {
    if (this.loginForm.invalid) return;

    const formValues = {
      username: this.loginForm.getRawValue().username?.trim(),
      password: this.loginForm.getRawValue().password?.trim(),
    };

    this.loading = true;
    this.subscribeTo = this.authService
      .logIn(formValues as ILoginForm)
      .subscribe({
        next: (response: IResponse<ILoginResponse>): void => {
          if (response.status === ResponseStatusesEnum.Error) {
            this.loading = false;
            this.createErrorMessage(
              response.message || 'Ошибка при входе в систему',
            );

            return;
          }

          this.loading = false;
          this.router.navigate(['/admin']);
          this.createBasicMessage();
        },
        error: (err): void => {
          console.log(err);
          this.loading = false;
          this.createErrorMessage(err?.message || 'Ошибка при входе в систему');
        },
      });

    this.cdr.markForCheck();
  }

  private createBasicMessage(): void {
    this.message.create('success', 'Вы успешно вошли в систему!', {
      nzDuration: 2000,
    });
  }

  private createErrorMessage(text: string): void {
    this.message.create('error', text, {
      nzDuration: 2000,
    });
  }
}
