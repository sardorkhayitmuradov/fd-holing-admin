import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import download from 'downloadjs'
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
import { asapScheduler, map, Observable } from 'rxjs';

import { IDocument, IDocumentsList, IReqeustDocumentCreate } from '@core/interceptors/documents/documents.interface';
import { DocumentService } from '@core/services/requests/documents/documents.service';
import { AccessTokenStorageService } from '@core/services/root/storage.service';
import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';
import { TextMaskPipe } from '@shared/pipes/text-mask.pipe';

import { documentList } from './constants/document-list';
import { DataItem, IPaginationDocuments } from './interface/document-list.interface';

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
  public documentList$: Observable<IDocument[]>;

  public paginationDocuments: IPaginationDocuments = {
    page: 1,
    limit: 20
  };

  public readonly message = inject(NzMessageService);
  public readonly notification = inject(NzNotificationService);
  private readonly _formBuilder = inject(UntypedFormBuilder);
  private readonly _documentService = inject(DocumentService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _cdr = inject(ChangeDetectorRef)
  
  private readonly _http = inject(HttpClient)

  public constructor(@Inject(DOCUMENT) private document: Document) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();

    this.navigateTo()
  }

  public showAddDocumentModal(): void {
    this.isVisibleAddDocumentModal = true;
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

  // Pagination change
  public handlePageChange(page: number): void {
    this.paginationDocuments.page = page;
    this.isLoadingTable = true;
    this._router.navigate([], {
      queryParams: { page: page, limit: this.paginationDocuments.limit },
    });
    this.getDocumentsList(this.paginationDocuments);
  }

  public handleLimitChange(limit: number): void {
    this.paginationDocuments.limit = limit;
    this.isLoadingTable = true;
    this._router.navigate([], {
      queryParams: { page: this.paginationDocuments.page, limit: limit },
    });
    this.getDocumentsList(this.paginationDocuments);
  }

  // Navigate to

  public navigateTo(): void {
    const activePageParam = +this._activatedRoute.snapshot.queryParams["page"];
    const activeLimitParam = +this._activatedRoute.snapshot.queryParams["limit"]

    if (isFinite(activePageParam)) {
      this.paginationDocuments.page = activePageParam;
    }

    if (isFinite(activeLimitParam)) {
      this.paginationDocuments.limit = activeLimitParam;
    }
    
    this.getDocumentsList(this.paginationDocuments)
  }

  // Download
  public handleDownloadDocument(
    doc: IDocument
  ): void {
    if(!doc.document) {
      this.message.create("error", "Файл недоступен по причине отсутствия!", {
        nzDuration: 2000,
      })

      return;
    }

    const url = `https://fdholding.gymrat.uz/${doc.document}`;
    
    this.downloadPdf(url)
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

  // form

  public createDocument(): void {
    const documentFormValue = this.addDocumentForm.getRawValue() as IReqeustDocumentCreate;

    if(this.addDocumentForm.invalid) return;

    // Method to add document using fetch
    this.isLoadingTable = true;

    this.subscribeTo = this._documentService.addDocument(documentFormValue).subscribe(
      {
        next: (): void => {
          this.isLoadingTable = false;
          this.isVisibleAddDocumentModal = false;

          this.message.create("success", "Документ успешно создан!", {
            nzDuration: 2000,
          })

          this.getDocumentsList(this.paginationDocuments);

          this._cdr.detectChanges();
        },
        error: (err): void => {
          this.message.create("error", err.error.message || 'Произошла ошибка в системе!', {
            nzDuration: 2000,
          })
          this.isLoadingTable = false;
        },
      }
    )
  }

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

  // Doucment list

  private getDocumentsList(pagination: IPaginationDocuments): void {
    this.documentList$ = this._documentService.getDocumentsList(
      pagination
    ).pipe(
      map((response: IDocumentsList): IDocument[] => {
        this.paginationDocuments.page = Number(response.page);
        this.paginationDocuments.limit = Number(response.limit);
        this.isLoadingTable = false;

        return response.documents
      })
    )
  }

  // download blob

  private downloadPdf(url: string): void {
    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      }
    }).then(function(resp) {
      return resp.blob();
    }).then(function(blob) {
      download(blob);
    });
  }

}
