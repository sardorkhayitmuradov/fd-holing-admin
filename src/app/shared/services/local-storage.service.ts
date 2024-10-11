import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";

export interface LocalStorageState {
  dispatcherSidebarWidth: number
  accessToken: string
  refreshToken: string
  tokenType: string
  asteriskUsername: string
  asteriskPassword: string
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private document = inject(DOCUMENT)

  public setItem<T extends keyof LocalStorageState>(key: T, value: LocalStorageState[T]): void {
    this.document.defaultView?.localStorage.setItem(key, JSON.stringify(value))
  }

  public getItem<T extends keyof LocalStorageState>(key: T): LocalStorageState[T] | null {
    const value = this.document.defaultView?.localStorage.getItem(key)

    return value ? JSON.parse(value) : null
  }

  public removeItem(key: keyof LocalStorageState): void {
    this.document.defaultView?.localStorage.removeItem(key)
  }
}
