import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UnsubscribeDirective } from '@app/shared/directives/unsubscribe.directive';
import { TextMaskPipe } from '@app/shared/pipes/text-mask.pipe';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconDirective, NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalComponent, NzModalContentDirective } from 'ng-zorro-antd/modal';
import {
  NzNotificationModule,
  NzNotificationService,
} from 'ng-zorro-antd/notification';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipDirective, NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { asapScheduler } from 'rxjs';

import { documentList } from './constants/document-list';
import { DataItem, DocumentAddFrom } from './interface/document-list.interface';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'fd-document-list',
  standalone: true,
  imports: [
    NzTableModule,
    NzTagModule,
    DatePipe,
    NzButtonModule,
    NzModalComponent,
    NzModalContentDirective,
    NzInputModule,
    ReactiveFormsModule,
    NzIconModule,
    NzIconDirective,
    NzToolTipModule,
    NzTooltipDirective,
    NzNotificationModule,
    NzFormModule,
    TextMaskPipe,
    RouterLink,
    NzDropdownMenuComponent,
    NzDatePickerComponent,
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
})
export class DocumentListComponent
  extends UnsubscribeDirective
  implements OnInit
{
  public randomId = 3243;
  public isLoadingTable = false;
  public isVisibleAddDocumentModal = false;

  public addDocumentForm!: FormGroup;
  public searchDocumentByField!: FormGroup;

  public searchDocumentByFieldVisible = {
    documentName: false,
    documentId: false,
    createdDate: false,
    title: false,
  };

  public listOfData: DataItem[] = documentList;

  public readonly message = inject(NzMessageService);
  public readonly notification = inject(NzNotificationService);
  private readonly _formBuilder = inject(UntypedFormBuilder);

  public constructor() {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public showAddDocumentModal(): void {
    this.isVisibleAddDocumentModal = true;
  }

  public handleOkDocumentModal(): void {
    const formValues = this.addDocumentForm.getRawValue() as DocumentAddFrom;

    this.isLoadingTable = true;
    this.isVisibleAddDocumentModal = false;

    if (this.addDocumentForm.invalid) return;

    asapScheduler.schedule((): void => {
      this.isLoadingTable = false;

      this.message.success('Вы успешно добавили документ!', {
        nzDuration: 3000,
      });

      this.listOfData = [
        {
          id: `${this.randomId}`,
          title: formValues?.title,
          document: 'No document',
          createdDate: new Date(),
        },
        ...this.listOfData,
      ];
    }, 2000);
  }

  public deleteDocument(id: string): void {
    this.isLoadingTable = true;
    this.listOfData = this.listOfData.filter((document) => document.id !== id);

    asapScheduler.schedule((): void => {
      this.isLoadingTable = false;

      this.message.success(
        'Вы успешно удалили документ, показанный в таблице!',
        {
          nzDuration: 1000,
        },
      );
    }, 500);
  }

  public handleCancelDocumentModal(): void {
    this.isVisibleAddDocumentModal = false;
  }

  // routing download

  public downloadDocument(): void {
    this.createBasicNotification();
  }

  public createBasicNotification(): void {
    this.notification.error(
      'Данный загружаемый PDF-файл находится в разработке!',
      'Пожалуйста, ознакомьтесь с другими услугами, представленными на сайте!',
      {
        nzDuration: 0,
        nzStyle: {
          width: '600px',
        },
        nzClass: 'test-class',
      },
    );
  }

  public reset(): void {
    this.search();
  }

  public search(): void {}

  // form

  private initForm(): void {
    this.addDocumentForm = this._formBuilder.nonNullable.group({
      title: ['Случайное название', Validators.required],
    });

    this.searchDocumentByField = this._formBuilder.nonNullable.group({
      documentName: [''],
      documentId: [''],
      createdDate: [''],
      title: [''],
    });
  }
}
