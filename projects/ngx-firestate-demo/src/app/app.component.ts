import { Component } from '@angular/core';
import {
  DocPaths1,
  FirestateInstances,
  DocPaths3
} from './firestate-config.module';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <h1>Collection</h1>
    <pre>
    {{ collection$ | async }}
    </pre
    >
  `
})
export class AppComponent {
  collection$: Observable<any>;

  constructor(private instances: FirestateInstances) {
    this.collection$ = this.instances.app1.db
      .FromCollection(DocPaths1.Doc1)
      .GetAllDocs();
  }
}
