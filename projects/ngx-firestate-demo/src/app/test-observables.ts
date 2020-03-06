import { Component, OnInit } from "@angular/core";
import { FirestateFacade } from "./firestate-config.module";
import { Observable } from "rxjs";
import { take, map } from "rxjs/operators";

@Component({
  selector: "test-observables",
  template: `
    <h5>Client State</h5>
    <pre>{{ stateFromFire$ | async | json }}</pre>
    <button (click)="onClickInrc()">Increment x</button>
    <h2>Observable Doc Path</h2>
    <p>{{ docPath$ | async }}</p>
  `
})
export class TestObservablesComponent implements OnInit {
  stateFromFire$: Observable<any>;
  docPath$: Observable<string>;

  constructor(private fires: FirestateFacade) {
    this.stateFromFire$ = this.fires.app1.$GetRootState();
    this.docPath$ = this.fires.fire
      .UNSAFEFromCollection("/items/users/${x}", 2)
      .ref()
      .pipe(map(coll => coll.path));
  }

  ngOnInit() {}

  async onClickInrc() {
    const s = await this.fires.app1
      .$GetRootState()
      .pipe(take(1))
      .toPromise();
    const x = s.x || 1;
    this.fires.app1.PatchRootState({ x: x + 1 });
  }
}
