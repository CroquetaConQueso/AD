import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, NgFor],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    menuItems = [
        { label: 'Dashboard', route: '/dashboard', icon: 'fa-solid fa-chart-line' },
        { label: 'Personal', route: '/staff', icon: 'fa-solid fa-user-doctor' },
        { label: 'Pacientes', route: '/patients', icon: 'fa-solid fa-hospital-user' },
        { label: 'Medicinas', route: '/medicines', icon: 'fa-solid fa-pills' },
        { label: 'Tratamientos', route: '/treatments', icon: 'fa-solid fa-file-medical' }
    ];
}
