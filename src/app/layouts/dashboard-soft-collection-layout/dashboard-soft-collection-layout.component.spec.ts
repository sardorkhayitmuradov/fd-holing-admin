import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSoftCollectionLayoutComponent } from './dashboard-soft-collection-layout.component';

describe('DashboardSoftCollectionLayoutComponent', () => {
  let component: DashboardSoftCollectionLayoutComponent;
  let fixture: ComponentFixture<DashboardSoftCollectionLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSoftCollectionLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSoftCollectionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
