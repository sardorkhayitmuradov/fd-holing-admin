import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import download from 'downloadjs'
import { asapScheduler } from "rxjs";

import { DocumentService } from '@core/services/requests/documents/documents.service';
import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';

@Component({
  selector: 'fd-client',
  standalone: true,
  imports: [],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent extends UnsubscribeDirective implements OnInit {
  private readonly _documentService = inject(DocumentService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  public constructor() {
    super()
  }

  public ngOnInit(): void {
    const id = this._activatedRoute.snapshot.params["id"];
    const fileName = this._activatedRoute.snapshot.queryParams["fileName"];

    this.downloadDocument(id, fileName)
  }

  private viewCount(id: string): void {
    fetch("https://fdholding.gymrat.uz/documents/view/" + id, {
      method: 'PUT',
      headers: {
        'Content-Type': "application/json",
        'x-realm': "fd-holding"
      }
    });
  }

  private downloadDocument(id: string, fileName: string): void {
    if (!fileName && !id) {
      asapScheduler.schedule(() => {
        this._router.navigate(["/error"]);
      }, 1000)

      return;
    }

    const url = `https://fdholding.gymrat.uz/uploads/${fileName}`;

    this.viewCount(id);
    this.downloadPdf(url);

  }

  private downloadPdf(url: string): void {
    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      }
    }).then(function (resp) {
      return resp.blob();
    }).then(function (blob) {
      download(blob);
    });
  }
}
