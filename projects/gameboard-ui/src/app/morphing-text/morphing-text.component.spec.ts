import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MorphingTextComponent } from './morphing-text.component';

describe('MorphingTextComponent', () => {
  let component: MorphingTextComponent;
  let fixture: ComponentFixture<MorphingTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MorphingTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MorphingTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
