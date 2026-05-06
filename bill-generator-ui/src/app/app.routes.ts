import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GenerateComponent } from './pages/generate/generate.component';
import { TemplatesComponent } from './pages/templates/templates.component';
import { AiAssistantComponent } from './pages/ai-assistant/ai-assistant.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'generate', component: GenerateComponent },
  { path: 'templates', component: TemplatesComponent },
  { path: 'ai', component: AiAssistantComponent },
  { path: '**', redirectTo: '' }
];
