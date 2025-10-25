import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AlmacenesComponent } from './pages/almacenes/almacenes';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { MarcasComponent } from './pages/marcas/marcas';
import { ProductosComponent } from './pages/productos/productos';
import { ClientesComponent } from './pages/clientes/clientes';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'almacenes', component: AlmacenesComponent},
      { path: 'proveedores', component: ProveedoresComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'marcas', component: MarcasComponent },
      { path: 'productos', component: ProductosComponent },
        { path: 'clientes', component: ClientesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // Redirige a dashboard por defecto
    ]
  },
  { path: '**', redirectTo: 'dashboard' } // Redirige cualquier ruta no encontrada
];