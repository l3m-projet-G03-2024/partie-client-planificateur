import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren, WritableSignal, computed, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';

interface ListDD_Data<T> {
  readonly sig: WritableSignal<readonly T[]>;
  readonly value: T;
}

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [
    CommonModule, MatListModule,
    CdkDropList, CdkDrag,
  ],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsComponent implements AfterViewInit {
  readonly sigL1 = signal<readonly string[]>(["A", "B", "C", "D"])
  readonly sigL2 = signal<readonly string[]>(["X", "Y", "Z"])
  readonly sigL3 = signal<readonly string[]>(["1", "2", "3", "4", "5"])

  readonly sigLists = computed(() => [this.sigL1, this.sigL2, this.sigL3]);

  @ViewChildren("L") matLists!: QueryList<CdkDropList>;
  private readonly _sigDropListRefs = signal<CdkDropList<any>[]>([])
  readonly sigDropListRefs = this._sigDropListRefs.asReadonly();


  ngAfterViewInit(): void {
    const update = () => {
      const L = this.matLists.toArray();
      this._sigDropListRefs.set(L)
    };
    
    this.matLists.changes.subscribe(update);
    update();
  }

  dropIntoList(sigTarget: WritableSignal<readonly string[]>, dropEvent: CdkDragDrop<unknown, unknown, ListDD_Data<string>>) {
    
    // Remove from source
    const { sig: sigSource, value } = dropEvent.item.data;

    if (sigSource === sigTarget && dropEvent.currentIndex === dropEvent.previousIndex) {
      return
    }

    sigSource.update(L => L.filter(e => e !== value))
    
    // Append to target, at the right index
    sigTarget.update(L => {
      const nL = [...L]
      nL.splice(dropEvent.currentIndex, 0, value)
      return nL;
    })

    console.log( sigTarget() )
  }
}
