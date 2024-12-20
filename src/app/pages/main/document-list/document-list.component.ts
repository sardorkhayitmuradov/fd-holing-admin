import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import download from 'downloadjs';
import moment from 'moment';
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
import { map, Observable } from 'rxjs';

import {
  IDocument,
  IDocumentsList,
  IReqeustDocumentCreate,
  IReqeustDocumentListSearch,
} from '@core/interceptors/documents/documents.interface';
import { DocumentService } from '@core/services/requests/documents/documents.service';
import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';
import { TextMaskPipe } from '@shared/pipes/text-mask.pipe';

import { IPaginationDocuments } from './interface/document-list.interface';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'fd-document-list',
  standalone: true,
  imports: [
    CommonModule,
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
    NzPopconfirmModule,
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

  public documentList$: Observable<IDocument[]>;

  public paginationDocuments: IPaginationDocuments = {
    page: 1,
    limit: 20,
    total: 0,
  };

  public readonly message = inject(NzMessageService);
  public readonly notification = inject(NzNotificationService);
  protected readonly Number = Number;
  private readonly _formBuilder = inject(UntypedFormBuilder);
  private readonly _documentService = inject(DocumentService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _http = inject(HttpClient);

  public constructor(@Inject(DOCUMENT) private document: Document) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();

    this.navigateTo();
  }

  public showAddDocumentModal(): void {
    this.isVisibleAddDocumentModal = true;
  }

  public deleteDocument(id: string): void {
    this.isLoadingTable = true;

    if (!id) {
      this.isLoadingTable = false;

      return;
    }

    this.subscribeTo = this._documentService.deleteDocumentById(id).subscribe({
      next: (): void => {
        this.isLoadingTable = false;
        this.isVisibleAddDocumentModal = false;

        this.message.create(
          'success',
          'Вы успешно удалили документ, показанный в таблице!',
          {
            nzDuration: 1000,
          },
        );

        this.getDocumentsList(this.paginationDocuments);

        this._cdr.detectChanges();
      },
      error: (err): void => {
        this.isLoadingTable = false;
        this.message.create(
          'error',
          err.error.message || 'Произошла ошибка в системе!',
          {
            nzDuration: 1000,
          },
        );
      },
    });
  }

  // routing download

  public handleCancelDocumentModal(): void {
    this.isVisibleAddDocumentModal = false;
  }

  public reset(): void {
    this.getDocumentsList(this.paginationDocuments);
  }

  public resetByField(
    fields: 'title' | 'docName' | 'createdDate' | 'documentNumber',
  ): void {
    if (fields == 'title') this.searchTitleVisible = false;
    if (fields == 'docName') this.searchDocumentNameVisible = false;
    if (fields == 'createdDate') this.searchCreatedDateVisible = false;
    if (fields == 'documentNumber') this.searchDocumentIdVisible = false;
  }

  public search(): void {
    this.searchDocuments();
  }

  public formatDate(): string {
    const dateValue =
      this.searchDocumentByField.controls['createdDate'].getRawValue();

    if (!dateValue) return '';

    // Ensure dateValue is valid before using moment
    const validDate = moment(dateValue).isValid() ? moment(dateValue) : null;

    if (validDate) {
      // Set the formatted value to the expected format: YYYY-MM-DDTHH:mm:ss.SSSSSSSSS
      this.searchDocumentByField.controls['createdDate'].setValue(
        validDate.format('YYYY-MM-DD'),
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
  };

  // Pagination change
  public handlePageChange(page: number): void {
    this.paginationDocuments.page = page;
    this.isLoadingTable = true;
    this._router.navigate([], {
      queryParams: { page: page, limit: this.paginationDocuments.limit },
    });
    this.getDocumentsList(this.paginationDocuments);
  }

  // Navigate to

  public handleLimitChange(limit: number): void {
    this.paginationDocuments.limit = limit;
    this.isLoadingTable = true;
    this._router.navigate([], {
      queryParams: { page: this.paginationDocuments.page, limit: limit },
    });
    this.getDocumentsList(this.paginationDocuments);
  }

  public navigateTo(): void {
    const activePageParam = +this._activatedRoute.snapshot.queryParams['page'];
    const activeLimitParam =
      +this._activatedRoute.snapshot.queryParams['limit'];

    if (isFinite(activePageParam)) {
      this.paginationDocuments.page = activePageParam;
    }

    if (isFinite(activeLimitParam)) {
      this.paginationDocuments.limit = activeLimitParam;
    }

    this.getDocumentsList(this.paginationDocuments);
  }

  // Download
  public handleDownloadDocument(doc: IDocument): void {
    if (!doc.original) {
      this.message.create('error', 'Файл недоступен по причине отсутствия!', {
        nzDuration: 2000,
      });

      return;
    }

    const url = `https://api.fd-holding.org/document/${doc._id}`;

    this.downloadPdf(url);
  }

  // form

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

  public createDocument(): void {
    const documentFormValue =
      this.addDocumentForm.getRawValue() as IReqeustDocumentCreate;

    if (this.addDocumentForm.invalid) return;

    // Method to add document using fetch
    this.isLoadingTable = true;

    this.subscribeTo = this._documentService
      .addDocument(documentFormValue)
      .subscribe({
        next: (): void => {
          this.isLoadingTable = false;
          this.isVisibleAddDocumentModal = false;

          this.message.create('success', 'Документ успешно создан!', {
            nzDuration: 2000,
          });

          this.getDocumentsList(this.paginationDocuments);

          this._cdr.detectChanges();
        },
        error: (err): void => {
          this.message.create(
            'error',
            err.error.message || 'Произошла ошибка в системе!',
            {
              nzDuration: 2000,
            },
          );
          this.isLoadingTable = false;
        },
      });
  }

  // Document list

  private initForm(): void {
    this.addDocumentForm = this._formBuilder.nonNullable.group({
      title: ['Document', Validators.required],
    });

    this.searchDocumentByField = this._formBuilder.nonNullable.group({
      docName: [''],
      documentNumber: [''],
      createdDate: [''],
      title: [''],
    });
  }

  // download blob

  private getDocumentsList(pagination: IPaginationDocuments): void {
    const filteredPagination = {
      page: pagination?.page,
      limit: pagination?.limit,
    };

    this.isLoadingTable = true;
    this.documentList$ = this._documentService
      .getDocumentsList(filteredPagination)
      .pipe(
        map((response: IDocumentsList): IDocument[] => {
          this.isLoadingTable = false;
          this.paginationDocuments.total = response.total;
          this.paginationDocuments.page = Number(response.page);
          this.paginationDocuments.limit = Number(response.limit);

          const startIndex =
            (Number(response.page) - 1) * Number(response.limit);

          const documents: IDocument[] = response?.documents?.map(
            (document: IDocument, index: number) => {
              return {
                ...document,
                i: startIndex + index + 1,
              };
            },
          );

          return documents;
        }),
      );
  }

  private downloadPdf(url: string): void {
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    })
      .then(function (resp) {
        return resp.blob();
      })
      .then(function (blob) {
        download(blob);
      });
  }

  // Search
  private searchDocuments(): void {
    const formValue =
      this.searchDocumentByField.getRawValue() as IReqeustDocumentListSearch;

    this.isLoadingTable = true;

    const searchFields: IReqeustDocumentListSearch = {};

    for (const key in formValue) {
      if (formValue[key]) {
        searchFields[key] = formValue[key].trim() as string;
      }
    }

    this.documentList$ = this._documentService
      .searchDocument(searchFields)
      .pipe(
        map((response: IDocumentsList): IDocument[] => {
          this.searchTitleVisible = false;
          this.searchCreatedDateVisible = false;
          this.searchDocumentIdVisible = false;
          this.isLoadingTable = false;

          return response.documents;
        }),
      );
  }
}
