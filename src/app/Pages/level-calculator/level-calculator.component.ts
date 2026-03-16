import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

interface LevelStep {
  from: number;
  to: number;
  pieces: number;
  silver: number;
}

const LEVEL_DATA: LevelStep[] = [
  { from: 1,  to: 2,  pieces: 50,   silver: 150   },
  { from: 2,  to: 3,  pieces: 95,   silver: 300   },
  { from: 3,  to: 4,  pieces: 170,  silver: 600   },
  { from: 4,  to: 5,  pieces: 325,  silver: 1200  },
  { from: 5,  to: 6,  pieces: 465,  silver: 2000  },
  { from: 6,  to: 7,  pieces: 610,  silver: 2600  },
  { from: 7,  to: 8,  pieces: 750,  silver: 3275  },
  { from: 8,  to: 9,  pieces: 900,  silver: 4000  },
  { from: 9,  to: 10, pieces: 1050, silver: 4500  },
  { from: 10, to: 11, pieces: 1185, silver: 5200  },
  { from: 11, to: 12, pieces: 1325, silver: 5875  },
  { from: 12, to: 13, pieces: 1460, silver: 6500  },
  { from: 13, to: 14, pieces: 1600, silver: 7200  },
  { from: 14, to: 15, pieces: 1725, silver: 7800  },
  { from: 15, to: 16, pieces: 1850, silver: 8500  },
  { from: 16, to: 17, pieces: 2000, silver: 9100  },
  { from: 17, to: 18, pieces: 2150, silver: 9800  },
  { from: 18, to: 19, pieces: 2300, silver: 10400 },
  { from: 19, to: 20, pieces: 2450, silver: 11000 },
];

@Component({
  selector: 'app-level-calculator',
  imports: [CommonModule, FormsModule, Breadcrumb],
  templateUrl: './level-calculator.component.html',
  styleUrl: './level-calculator.component.sass',
})
export class LevelCalculatorComponent implements OnInit {
  items: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  currentLevel: number = 1;
  targetLevel: number = 2;

  currentLevelOptions: number[] = [];
  targetLevelOptions: number[] = [];

  totalPieces: number = 0;
  totalSilver: number = 0;
  stepDetails: LevelStep[] = [];

  ngOnInit(): void {
    this.items = [{ label: 'Level Calculator' }];
    this.currentLevelOptions = Array.from({ length: 19 }, (_, i) => i + 1);
    this.updateTargetOptions();
    this.calculate();
  }

  onCurrentLevelChange(): void {
    if (this.targetLevel <= this.currentLevel) {
      this.targetLevel = this.currentLevel + 1;
    }
    this.updateTargetOptions();
    this.calculate();
  }

  onTargetLevelChange(): void {
    this.calculate();
  }

  private updateTargetOptions(): void {
    const min = this.currentLevel + 1;
    this.targetLevelOptions = Array.from({ length: 20 - min + 1 }, (_, i) => i + min);
  }

  private calculate(): void {
    this.stepDetails = LEVEL_DATA.filter(
      s => s.from >= this.currentLevel && s.to <= this.targetLevel
    );
    this.totalPieces = this.stepDetails.reduce((sum, s) => sum + s.pieces, 0);
    this.totalSilver = this.stepDetails.reduce((sum, s) => sum + s.silver, 0);
  }
}
