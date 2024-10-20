import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import moment from "moment";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
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

import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';
import { TextMaskPipe } from '@shared/pipes/text-mask.pipe';

import { documentList } from './constants/document-list';
import { DataItem, DocumentAddFrom } from './interface/document-list.interface';

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

  public searchDocumentNameVisible = false;
  public searchDocumentIdVisible = false;
  public searchCreatedDateVisible = false;
  public searchTitleVisible = false;

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

  public reset(fields: 'title' | 'documentName' | 'createdDate' | 'documentId'): void {
    if(fields == 'title') this.searchTitleVisible = false;
    if(fields == 'documentName') this.searchDocumentNameVisible = false;
    if(fields == 'createdDate') this.searchCreatedDateVisible = false;
    if(fields == 'documentId') this.searchDocumentIdVisible = false;
  }

  public search(): void {
    this.searchTitleVisible = false;
    this.searchDocumentNameVisible = false;
    this.searchCreatedDateVisible = false;
    this.searchDocumentIdVisible = false;
  }

  public formatDate(): string {
    const dateValue = this.searchDocumentByField.controls['createdDate'].getRawValue();
  
    if (!dateValue) return "";
  
    // Ensure dateValue is valid before using moment
    const validDate = moment(dateValue).isValid() ? moment(dateValue) : null;

    if (validDate) {
      // Set the formatted value to the expected format: YYYY-MM-DDTHH:mm:ss.SSSSSSSSS
      this.searchDocumentByField.controls['createdDate'].setValue(
        validDate.format("YYYY-MM-DD")
      );
    } else {
      // eslint-disable-next-line no-console
      console.error('Invalid date value');
    }
  
    return this.searchDocumentByField.controls['createdDate'].getRawValue();
  }

  public disableFutureDates = (current: Date): boolean => {
    const today = new Date();

    return current > today;
  }

  // form

  private initForm(): void {
    this.addDocumentForm = this._formBuilder.nonNullable.group({
      title: ['Случайное название', Validators.required],
    });

    this.searchDocumentByField = this._formBuilder.nonNullable.group({
      documentName: [''],
      documentId: [''],
      createdDate: [new Date()],
      title: [''],
    });
  }
}
