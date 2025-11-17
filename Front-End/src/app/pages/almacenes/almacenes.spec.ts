import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Almacenes } from './almacenes';

describe('Almacenes', () => {
  let component: Almacenes;
  let fixture: ComponentFixture<Almacenes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Almacenes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Almacenes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
