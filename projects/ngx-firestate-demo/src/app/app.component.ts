import { Component, OnInit } from "@angular/core";
import { FirestateFacade, CollectionPaths } from "./firestate-config.module";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LogLevel } from 'projects/ngx-firestate/src/lib/instance/firebase/interfaces/LogLevel';

@Component({
  selector: "app-root",
  template: `
    <button>
      {{ loggedInStatus$ | async }}
    </button>

    <h1>Collection</h1>
    <pre *ngIf="collection$">
    {{ collection$ | async | json }}
    </pre
    >
    <pre *ngIf="collection$">
    {{ collection2$ | async | json }}
    </pre
    >
    {{text}}
  `
})
export class AppComponent implements OnInit {
  collection$: Observable<any[]>;
  collection2$: Observable<any[]>;

  loggedInStatus$: Observable<string>;
  text = ''

  constructor(private instances: FirestateFacade) {}

  async ngOnInit() {
    this.loggedInStatus$ = this.instances.app1.$IsLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return "Is Logged In";
        }
        return "Not Logged In";
      })
    );
    this.collection$ = this.instances.fire
      .FromCollection(CollectionPaths.Doc1, LogLevel.TRACE)
      .GetAllDocs();
    this.collection2$ = this.instances.fire
      .FromCollection(CollectionPaths.Doc2)
      .GetAllDocs();

    setTimeout(() => {
      this.text = 'asdasd';
    }, 1000)
  }

  login() {
    // return this.instances.app1.login(
    //   "hello@benwinding.com",
    //   "hello@benwinding.com"
    // );
  }
}
