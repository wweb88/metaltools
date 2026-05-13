import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

@Component({
  selector: 'app-reglamentos',
  imports: [Breadcrumb],
  templateUrl: './reglamentos.component.html',
  styleUrl: './reglamentos.component.sass'
})
export class ReglamentosComponent {
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  items: MenuItem[] = [{ label: 'Reglamentos de Brigadas' }];
}
