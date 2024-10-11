import { Injectable } from "@angular/core";

import { from, Observable, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  public openDatabase(name: string, version = 1): ReactiveDb {
    return new ReactiveDb(name, version);
  }
}

export class ReactiveDb {
  private db: IDBDatabase | null = null;
  private dbReady = new Subject<IDBDatabase>();

  public constructor(private readonly dbName: string, private readonly dbVersion = 1) {
    this.openDatabase();
  }

  /** Adds an item to the IndexedDB and returns an Observable with the generated ID */
  public addItem<T>(item: T): Observable<number> {
    return this.getDb().pipe(
      switchMap((db) => {
        return new Observable<number>((observer) => {
          const transaction = db.transaction('items', 'readwrite');
          const objectStore = transaction.objectStore('items');
          const request = objectStore.add(item);

          request.onsuccess = (): void => {
            const id = request.result as number;

            observer.next(id);
            observer.complete();
          };

          request.onerror = (): void => {
            observer.error(request.error);
          };
        });
      })
    );
  }

  /** Retrieves an item by ID from the IndexedDB and returns an Observable with the item */
  public getItem<T>(id: number): Observable<T> {
    return this.getDb().pipe(
      switchMap((db) => {
        return new Observable<T>((observer) => {
          const transaction = db.transaction('items', 'readonly');
          const objectStore = transaction.objectStore('items');
          const request = objectStore.get(id);

          request.onsuccess = (): void => {
            observer.next(request.result);
            observer.complete();
          };

          request.onerror = (): void => {
            observer.error(request.error);
          };
        });
      })
    );
  }

  public getAllItems<T>(): Observable<T[]> {
    return this.getDb().pipe(
      switchMap((db) => {
        return new Observable<T[]>((observer) => {
          const transaction = db.transaction('items', 'readonly');
          const objectStore = transaction.objectStore('items');
          const request = objectStore.getAll();

          request.onsuccess = (): void => {
            observer.next(request.result);
            observer.complete();
          };

          request.onerror = (): void => {
            observer.error(request.error);
          };
        });
      })
    );
  }

  public deleteItem(id: number): Observable<void> {
    return this.getDb().pipe(
      switchMap((db) => {
        return new Observable<void>((observer) => {
          const transaction = db.transaction('items', 'readwrite');
          const objectStore = transaction.objectStore('items');
          const request = objectStore.delete(id);

          request.onsuccess = (): void => {
            observer.next();
            observer.complete();
          };

          request.onerror = (): void => {
            observer.error(transaction.error);
          };
        });
      })
    );
  }

  private getDb(): Observable<IDBDatabase> {
    if (this.db) {
      return from(Promise.resolve(this.db));
    } else {
      return this.dbReady.asObservable();
    }
  }

  private openDatabase(): void {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (): void => {
      const db = request.result;

      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (): void => {
      this.db = request.result;
      console.log('Database opened successfully');
      this.dbReady.next(this.db);
      this.dbReady.complete();
    };

    request.onerror = (): void => {
      console.error('Database error:', request.error);
      this.dbReady.error(request.error);
    };
  }
}
