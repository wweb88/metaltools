import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LevelCalculatorComponent } from './level-calculator.component';

describe('LevelCalculatorComponent', () => {
  let component: LevelCalculatorComponent;
  let fixture: ComponentFixture<LevelCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelCalculatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LevelCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
