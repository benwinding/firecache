import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const allRoutes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(allRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
