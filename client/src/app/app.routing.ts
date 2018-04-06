import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogInComponent } from './components/login.component';
import { NewUserComponent } from './components/new_user.component';
import { ChatComponent } from './components/chat.component'

const appRoutes: Routes = [
	//login
	{path: '', component: LogInComponent},
	{path: 'login', component: LogInComponent},

	//new user
	{path: 'new', component: NewUserComponent},

	//chat
	{path: 'chat', component: ChatComponent},

	//error 404
	{path: '**', component: LogInComponent},
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);