export class LocalStorageUtil {
  public set(key: LocalStorageKeys, value: any) {
      localStorage.setItem(key, JSON.stringify({value}));
  }

  public get(key: LocalStorageKeys): any {
      return JSON.parse(localStorage.getItem(key));
  }

  public remove(key: LocalStorageKeys) {
      localStorage.removeItem(key);
  }

  public clear() {
      localStorage.clear();
  }
}

export enum LocalStorageKeys {
  approves = 'approves',
}
