import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Importar Chart.js y componentes necesarios
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js';

// Registrar todo lo necesario
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
