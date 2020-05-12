import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsoleComponent } from './insole.component';

describe('InsoleComponent', () => {
  let component: InsoleComponent;
  let fixture: ComponentFixture<InsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
