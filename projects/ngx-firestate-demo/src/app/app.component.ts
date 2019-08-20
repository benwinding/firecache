import { Component } from '@angular/core';
import { DocPaths1, FirestateInstances, DocPaths3 } from './firestate-config.module';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
  `
})
export class AppComponent {
  constructor(private instances: FirestateInstances) {
    this.instances.app3.db.FromCollection(DocPaths3.Doc33);
  }
}
