import {Injectable, PipeTransform} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {Approve} from '../model/approval';
//import {APPROVES} from '../mocks/APPROVES';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortColumn, SortDirection} from '../helpers/approve.directive';

interface SearchResult {
  approves: Approve[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(approves: Approve[], column: SortColumn, direction: string): Approve[] {
  if (direction === '' || column === '') {
    return approves;
  } else {
    return [...approves].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(approve: Approve, term: string, pipe: PipeTransform) {
  return approve.addressFrom.toLowerCase().includes(term.toLowerCase());
}

@Injectable({providedIn: 'root'})

export class ApproveTableService {

  APPROVES = JSON.parse(localStorage.getItem('approves'));

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _approves$ = new BehaviorSubject<Approve[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._approves$.next(result.approves);
      this._total$.next(result.total);
    });
    this._search$.next();
  }

  get approves$() { return this._approves$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;
    const activeApproves = this.APPROVES.filter(approve => approve.deadline > (Date.now() / 1000))

    // 1. sort
    let approves = sort(activeApproves, sortColumn, sortDirection);

    // 2. filter
    approves = approves.filter(approve => matches(approve, searchTerm, this.pipe));
    const total = approves.length;

    // 3. paginate
    approves = approves.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({approves, total});
  }
}
