import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FixMeLater, QRCodeModule } from 'angularx-qrcode';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzQRCodeComponent } from 'ng-zorro-antd/qr-code';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzUploadComponent, NzUploadFile } from 'ng-zorro-antd/upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
export class DocumentComponent {
  public qrCodeLink = 'https://fd-holding/documents';
  public loading = false;

  public selectedFile: File | null = null; // Store the selected file
  public pdfSrc: string | undefined; // Preview the selected PDF

  public readonly message = inject(NzMessageService);
  public readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);

  // Read PDF for preview (optional)
  public readPdf(file: File): void {
    const fileReader = new FileReader();

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      this.pdfSrc = e.target?.result as string;
      this.cdr.detectChanges(); // Update the view after reading the file
    };

    fileReader.readAsArrayBuffer(file); // Read file as ArrayBuffer for PDF preview
  }

  // Custom upload request triggered by the "Save" button
  public customUploadRequest = (item: File): void => {
    // This method will be triggered when calling this.fileReader.readAsArrayBuffer()
    const formData = new FormData();
    formData.append('file', item as Blob); // Append the file for manual upload

    const headers = new HttpHeaders({
      Authorization: 'Bearer YOUR_TOKEN', // Replace with your authorization token if needed
    });

    this.loading = true;

    this.http
      .post('https://your-backend-endpoint/upload', formData, { headers })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.message.success('Файл успешно загружен!');
        },
        error: (error) => {
          this.loading = false;
          this.message.error('Ошибка при загрузке файла.');
        },
      });
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

  public beforeUpload = (file: any, fileList: NzUploadFile[]): boolean => {
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
}
