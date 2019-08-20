import { Component } from '@angular/core';
import { DocPaths1, AppInstances, DocPaths3 } from './firestate-config';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
  `
})
export class AppComponent {
  constructor(private instances: AppInstances) {
    this.instances.app3.db.FromCollection(DocPaths3.Doc33);
  }
}
