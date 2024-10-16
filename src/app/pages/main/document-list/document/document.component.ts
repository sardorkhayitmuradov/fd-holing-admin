import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FixMeLater, QRCodeModule } from 'angularx-qrcode';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzQRCodeComponent } from 'ng-zorro-antd/qr-code';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzUploadComponent } from 'ng-zorro-antd/upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';

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

  public originalPdfSrc: string | undefined = '';
  public translatedPdfSrc: string | undefined = '';

  public readonly message = inject(NzMessageService);
  public readonly cdr = inject(ChangeDetectorRef);

  public pdfReader = (type: 'translated' | 'original', pdfSrc: File): void => {
    const fileReader = new FileReader();

    fileReader.onload = (e): void => {
      if (type === 'translated')
        this.translatedPdfSrc = e.target?.result as string;
      if (type === 'original') this.originalPdfSrc = e.target?.result as string;
    };

    fileReader.readAsArrayBuffer(pdfSrc);
    this.cdr.detectChanges();
  };

  public onUploadChange(
    type: 'translated' | 'original',
    selectedFile: FixMeLater,
  ): void {
    const isPdf = selectedFile.type === 'application/pdf';
    const isLt2M = selectedFile.size! / 1024 / 1024 < 2;

    if (!isPdf) {
      this.message.error('You can only upload PDF file!');
    }

    if (!isLt2M) {
      this.message.error('Image must smaller than 2MB!');
    }

    this.pdfReader(type, selectedFile.file.originFileObj);
  }

  public deleteSelectedPdf(type: 'translated' | 'original'): void {
    if (type === 'translated') this.translatedPdfSrc = '';
    if (type === 'original') this.originalPdfSrc = '';
  }

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
