import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AlmacenesComponent } from './pages/almacenes/almacenes';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { MarcasComponent } from './pages/marcas/marcas';
import { ProductosComponent } from './pages/productos/productos';
import { ClientesComponent } from './pages/clientes/clientes';
import { ComprasComponent } from './pages/compras/compras';
import { VentasComponent } from './pages/ventas/ventas';
import { Movimientos } from './pages/movimientos/movimientos';
import { Ajustes } from './pages/ajustes/ajustes';
import { Login } from './pages/login/login';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta de login (pública)
  { 
    path: 'login', 
    component: Login,
    canActivate: [loginGuard] // Evita que usuarios autenticados accedan al login
  },
  
  // Rutas protegidas (requieren autenticación)
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // Protege todas las rutas del AdminLayout
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'almacenes', component: AlmacenesComponent},
      { path: 'proveedores', component: ProveedoresComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'marcas', component: MarcasComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'movimientos', component: Movimientos },
      { path: 'ajustes', component: Ajustes },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Redirige cualquier ruta no encontrada al login
  { path: '**', redirectTo: 'login' }
];
