import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzQRCodeComponent } from 'ng-zorro-antd/qr-code';
import { NzUploadChangeParam, NzUploadComponent } from 'ng-zorro-antd/upload';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

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
  ],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
})
export class DocumentComponent {
  @ViewChild('download', { static: false }) download!: ElementRef;

  public isQrCodeLoading = false;

  public readonly message = inject(NzMessageService);

  public downloadQrCode(): void {
    const canvas = document
      .getElementById('download')
      ?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      this.download.nativeElement.href = canvas.toDataURL('image/png');
      this.download.nativeElement.download = 'ng-zorro-antd';
      const event = new MouseEvent('click');
      this.download.nativeElement.dispatchEvent(event);
    }
  }

  public handleUploadOriginalChange({
    file,
    fileList,
  }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
      this.message.success(`${file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      this.message.error(`${file.name} file upload failed.`);
    }
  }

  public handleUploadTranslatedChange({
    file,
    fileList,
  }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
      this.message.success(`${file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      this.message.error(`${file.name} file upload failed.`);
    }
  }
}
