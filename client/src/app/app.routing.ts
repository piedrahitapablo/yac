import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login.component';
import { NewUserComponent } from './components/new_user.component';

const appRoutes: Routes = [
	//login
	{path: '', component: LoginComponent},
	{path: 'login', component: LoginComponent},

	//new user
	{path: 'new', component: NewUserComponent},

	//error 404
	// {path: '**', component: 404},
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);