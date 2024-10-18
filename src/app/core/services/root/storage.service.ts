import { Injectable } from '@angular/core';

import { ACCESS_TOKEN_KEY } from '../../constants/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public constructor(private readonly _storageKey: string) {}

  public setItem(value: string): void {
    localStorage.setItem(this._storageKey, value);
  }

  public getItem(): string {
    return localStorage.getItem(this._storageKey);
  }

  public removeItem(): void {
    localStorage.removeItem(this._storageKey);
  }

  public clearStorage(): void {
    localStorage.clear();
  }
}

@Injectable({
  providedIn: 'root',
})
export class AccessTokenStorageService extends StorageService {
  public constructor() {
    super(ACCESS_TOKEN_KEY);
  }
}
