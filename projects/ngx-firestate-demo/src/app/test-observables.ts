import { Component, OnInit } from "@angular/core";
import { FirestateFacade } from "./firestate-config.module";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "test-observables",
  template: `
    <h5>Client State</h5>
    <pre>{{ stateFromFire$ | async | json }}</pre>
    <button (click)="onClickInrc()">Increment x</button>
  `
})
export class TestObservablesComponent implements OnInit {
  stateFromFire$: Observable<any>;

  constructor(private fires: FirestateFacade) {
    this.stateFromFire$ = this.fires.app1.$GetRootState();
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
