import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { SquadToolComponent } from './Pages/squad-tool/squad-tool.component';
import { LevelCalculatorComponent } from './Pages/level-calculator/level-calculator.component';
import { ReglamentosComponent } from './Pages/reglamentos/reglamentos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'reglamentos', component: ReglamentosComponent },
  { path: 'squad-tool', component: SquadToolComponent },
  { path: 'level-calculator', component: LevelCalculatorComponent },
  { path: '**', redirectTo: '' }
];
