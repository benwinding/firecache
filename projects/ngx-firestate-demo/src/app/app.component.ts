import { Component } from '@angular/core';
import { DocPaths1, FirestateFacade, DocPaths2 } from './firestate-config.module';
import { Observable } from 'rxjs';
import { LogLevel } from 'projects/ngx-firestate/src/lib/instance/firebase/interfaces/LogLevel';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <h1>Collection</h1>
    <pre>
    {{ collection$ | async | json }}
    </pre
    >
    <pre>
    {{ collection2$ | async | json }}
    </pre
    >
  `
})
export class AppComponent {
  collection$: Observable<any>;
  collection2$: Observable<any>;

  constructor(private instances: FirestateFacade) {
    this.collection$ = this.instances.app1.db
      .FromCollection(DocPaths1.Doc1, LogLevel.TRACE)
      .GetAllDocs();
    this.collection2$ = this.instances.app2.db
      .FromCollection(DocPaths2.UsersCollection, LogLevel.NONE)
      .GetAllDocs();
  }
}
