import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FixMeLater, QRCodeModule } from 'angularx-qrcode';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzQRCodeComponent } from 'ng-zorro-antd/qr-code';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzUploadComponent } from 'ng-zorro-antd/upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { IDocument } from '@core/interceptors/documents/documents.interface';
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
    QRCodeModule,
    PdfViewerModule,
  ],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
})
export class DocumentComponent extends UnsubscribeDirective implements OnInit {
  public qrCodeLink = 'https://fd-holding.org/documents/';
  public loading = false;

  public selectedFile: File | null = null; // Store the selected file
  public pdfSrc: string | undefined; // Preview the selected PDF

  public readonly message = inject(NzMessageService);
  public readonly cdr = inject(ChangeDetectorRef);
  private readonly _documentService = inject(DocumentService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  // private readonly http = inject(HttpClient);
  
  private _document: IDocument;
  public constructor(){
    super()
  }

  public ngOnInit(): void {
    const id = this._activatedRoute.snapshot.params["id"];

    this.getDocument(id);
  }

  // Read PDF for preview (optional)
  public readPdf(file: File): void {
    const fileReader = new FileReader();

    fileReader.onload = (e: ProgressEvent<FileReader>): void => {
      this.pdfSrc = e.target?.result as string;
      this.cdr.detectChanges(); // Update the view after reading the file
    };

    fileReader.readAsArrayBuffer(file); // Read file as ArrayBuffer for PDF preview
  }

  // Custom upload request triggered by the "Save" button
  public customUploadRequest = (item: File): void => {
    this.loading = true;

    const documentNumber = this._document.documentNumber.split(" ").slice(-1)[0]

    if(!item && !this._document._id) {
      return;
    }

    this.subscribeTo = this._documentService.updateDocument(this._document._id, item, {
      documentNumber
    }).subscribe({
      next: () => {
        this.loading = false;
        this.message.success('Файл успешно загружен!');
      },
      error: (err) => {
        this.loading = false;
        this.message.error(err.error.message || 'Ошибка при загрузке файла.');
      },
    })
  };

  // Save function that sends the PDF file to the API
  public save(): void {
    if (!this.pdfSrc) {
      this.message.error('No file selected!');
      
      return;
    }

    this.customUploadRequest(this.selectedFile as File);
  }

  public deleteSelectedPdf(): void {
    this.pdfSrc = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public beforeUpload = (file: any): boolean => {
    if (file.type !== 'application/pdf') {
      this.message.error('Вы можете загружать только PDF файлы!');
      
      return false;
    }

    // Store the selected file
    this.selectedFile = file;

    // Optional: Preview or process the file here
    this.readPdf(file);

    this.message.success('Файл выбран. Нажмите "Сохранить" для загрузки.');
    
    return false; // Prevent automatic upload
  };

  // qr code
  public downloadQrCode(qrCode: FixMeLater): void {
    const parentElement =
      qrCode.qrcElement.nativeElement.querySelector('img').src;

    const blobData = this.convertBase64ToBlob(parentElement);
    // saves as image
    const blob = new Blob([blobData], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    // name of the file
    link.download = 'angularx-qrcode';

    link.click();
  }

  private convertBase64ToBlob(Base64Image: string): Blob {
    // split into two parts
    const parts = Base64Image.split(';base64,');
    // hold the content type
    const imageType = parts[0].split(':')[1];
    // decode base64 string
    const decodedData = window.atob(parts[1]);
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);

    // insert all character code into uint8array

    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }

    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType });
  }

  private getDocument(id: string): void {
    this.loading = true;

    this.subscribeTo = this._documentService.getDocumentById(id).subscribe(
      {
        next: (response: IDocument): void => {
          if(response.document) {
            
            this.qrCodeLink = this.qrCodeLink + id + "?fileName=" +  response.document.split("/").slice(-1);

            this.pdfSrc = "https://fdholding.gymrat.uz/" + response.document;
          }
          
          this._document = response;
          this.loading = false
        },
        error: (err): void => {
          this.loading = false
          this.message.create("error", err.error.message || 'Произошла ошибка в системе!', {
            nzDuration: 2000,
          })
        },
      }
    )
  }
}
