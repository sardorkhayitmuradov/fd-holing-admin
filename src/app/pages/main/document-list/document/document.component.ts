import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzQRCodeComponent } from 'ng-zorro-antd/qr-code';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzUploadComponent } from 'ng-zorro-antd/upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import {
  FileType,
  IDocument,
  SelectedFilesType,
} from '@core/interceptors/documents/documents.interface';
import { DocumentService } from '@core/services/requests/documents/documents.service';
import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';

@Component({
  selector: 'fd-document',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzResultComponent,
    RouterLink,
    NzQRCodeComponent,
    NzUploadComponent,
    NzIconDirective,
    PdfViewerModule,
  ],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
})
export class DocumentComponent extends UnsubscribeDirective implements OnInit {
  public loading = false;

  public selectedFiles: SelectedFilesType = {
    original: null,
    translated: null,
  }; // Store the selected file

  public original: string | null; // Preview the selected PDF
  public translated: string | null; // Preview the selected PDF

  public readonly message = inject(NzMessageService);
  public readonly cdr = inject(ChangeDetectorRef);
  private readonly _documentService = inject(DocumentService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  // private readonly http = inject(HttpClient);

  private _document: IDocument;
  public constructor() {
    super();
  }

  public ngOnInit(): void {
    const id = this._activatedRoute.snapshot.params['id'];

    this.getDocument(id);
  }

  // Read PDF for preview (optional)
  public readPdf(file: File, type: FileType): void {
    const fileReader = new FileReader();

    fileReader.onload = (e: ProgressEvent<FileReader>): void => {
      this[type] = e.target?.result as string;
      this.cdr.detectChanges(); // Update the view after reading the file
    };

    fileReader.readAsArrayBuffer(file); // Read file as ArrayBuffer for PDF preview
  }

  // Custom upload request triggered by the "Save" button
  public customUploadRequest = (items: SelectedFilesType): void => {
    this.loading = true;

    if (!items.original && !items.translated && !this._document._id) {
      return;
    }

    this.subscribeTo = this._documentService
      .updateDocument(this._document._id, items)
      .subscribe({
        next: () => {
          this.loading = false;
          this.message.success('Файл успешно загружен!');
        },
        error: (err) => {
          this.loading = false;
          this.message.error(err.error.message || 'Ошибка при загрузке файла.');
        },
      });
  };

  // Save function that sends the PDF file to the API
  public save(): void {
    if (!this.selectedFiles['original'] && !this.selectedFiles['translated']) {
      this.message.error('No file selected!');

      return;
    }

    this.customUploadRequest(this.selectedFiles as SelectedFilesType);
  }

  public deleteSelectedPdf(type: FileType): void {
    this[type] = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public beforeUploadOriginal = (file: any): boolean => {
    if (file.type !== 'application/pdf') {
      this.message.error('Вы можете загружать только PDF файлы!');

      return false;
    }

    // Store the selected file
    this.selectedFiles['original'] = file;

    // Optional: Preview or process the file here
    this.readPdf(file, 'original');

    this.message.success('Файл выбран. Нажмите "Сохранить" для загрузки.');

    return false; // Prevent automatic upload
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public beforeUploadTranslated = (file: any): boolean => {
    if (file.type !== 'application/pdf') {
      this.message.error('Вы можете загружать только PDF файлы!');

      return false;
    }

    // Store the selected file
    this.selectedFiles['translated'] = file;

    // Optional: Preview or process the file here
    this.readPdf(file, 'translated');

    this.message.success('Файл выбран. Нажмите "Сохранить" для загрузки.');

    return false; // Prevent automatic upload
  };

  private getDocument(id: string): void {
    this.loading = true;

    this.subscribeTo = this._documentService.getDocumentById(id).subscribe({
      next: (response: IDocument): void => {
        this.original = response.original
          ? 'https://fdholding.gymrat.uz/' + response.original
          : null;
        this.translated = response.translated
          ? 'https://fdholding.gymrat.uz/' + response.translated
          : null;

        this._document = response;
        this.loading = false;
      },
      error: (err): void => {
        this.loading = false;
        this.message.create(
          'error',
          err.error.message || 'Произошла ошибка в системе!',
          {
            nzDuration: 2000,
          },
        );
      },
    });
  }
}
