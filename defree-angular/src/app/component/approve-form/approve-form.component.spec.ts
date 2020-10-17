import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveFormComponent } from './approve-form.component';

describe('ApproveFormComponent', () => {
  let component: ApproveFormComponent;
  let fixture: ComponentFixture<ApproveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
