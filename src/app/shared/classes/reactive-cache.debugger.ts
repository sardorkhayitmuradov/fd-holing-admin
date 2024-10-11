import {
  __REACTIVE_CACHES_LIST__,
  __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__,
  EMPTY_SYMBOL
} from "@reactive-cache/core";
import { combineLatest, debounceTime, Subscription } from "rxjs";
import * as JsonPlugin from "tweakpane-json-plugin";

export interface ReactiveCacheDebuggerParams {
  isDev: boolean;
}

export class ReactiveCacheDebugger {
  private listUpdateSub: Subscription | undefined;
  private cachesListSub: Subscription | undefined;
  private pane: any;

  public initConsoleDebugger(params: ReactiveCacheDebuggerParams): void {
    if(params.isDev && typeof document !== 'undefined') {
      this.listUpdateSub = __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__.subscribe(() => {
        this.cachesListSub?.unsubscribe();
        this.cachesListSub = combineLatest(__REACTIVE_CACHES_LIST__).subscribe(() => {
          document.defaultView?.console.clear();
          document.defaultView?.console.table(__REACTIVE_CACHES_LIST__.map(({ name, value }) => ({ name, value })))
        })
      })
    }
  }

  public initTweakpaneDebugger(params: ReactiveCacheDebuggerParams): void {
    if(params.isDev && typeof document !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      window['__REACTIVE_CACHES_LIST__'] = __REACTIVE_CACHES_LIST__;

      import("tweakpane").then(({ Pane }) => {
        const container = document.createElement('div')

        document.body.appendChild(container)

        container.style.position = 'fixed'
        container.style.bottom = '0'
        container.style.right = '0'
        container.style.overflowY = 'auto'
        container.style.opacity = '0.3'
        container.style.maxHeight = '100vh'
        container.style.width = '450px'
        container.addEventListener('mouseenter', () => {
          container.style.opacity = '1'
        })
        container.addEventListener('mouseleave', () => {
          container.style.opacity = '0.3'
        })
        const pane = new Pane({ container });

        pane.registerPlugin(JsonPlugin);

        pane.element.style.fontSize = '14px'
        pane.addButton({
          title: '🗘',
          label: 'Update'
        }).on('click', () => {
          __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__.next()
        })
        const folder = pane.addFolder({ title: "Reactive Caches", expanded: false });

        this.pane = pane

        this.listUpdateSub = __REACTIVE_CACHES_LIST_UPDATE_OBSERVABLE__.subscribe(() => {
          this.cachesListSub?.unsubscribe();
          this.cachesListSub = combineLatest(__REACTIVE_CACHES_LIST__)
            .pipe(
              debounceTime(1000),
            )
            .subscribe(() => {
              try {
                folder.children.forEach((child) => folder.remove(child));
                __REACTIVE_CACHES_LIST__.forEach((state) => {
                  if(state.value === EMPTY_SYMBOL) {
                    return;
                  }

                  if (Array.isArray(state.value)) {
                    const newFolder = folder.addFolder({ title: state.name, expanded: false });

                    newFolder.addBinding(
                      { [state.name]: state.value },
                      state.name,
                      { view: 'json' }
                    ).on('change', ({ value }) => {
                      state.next(value)
                    });
                  } else if(state.value === null) {
                    folder.addBinding({ [state.name]: JSON.stringify(null) }, state.name)
                      .on('change', ({ value }) => {
                        try {
                          state.next(JSON.parse(value))
                        } catch(_ignored) {/* noop */}
                      });
                  } else if (typeof state.value === 'object') {
                    const newFolder = folder.addFolder({ title: state.name, expanded: false });

                    newFolder.addBinding({ object: state.value }, 'object', { view: 'json', label: state.name })
                      .on('change', ({ value }) => {
                        try {
                          state.next(typeof value === 'string' ? JSON.parse(value) : value)
                        } catch(_ignored) {/* noop */}
                      });
                  } else {
                    folder.addBinding({ [state.name]: state.value }, state.name);
                  }

                  folder.addBlade({ view: 'separator' })
                })

              } catch (e) {
                console.warn(e)
              }
            })
        })
      })
    }
  }

  public dispose(): void {
    this.listUpdateSub?.unsubscribe();
    this.cachesListSub?.unsubscribe();
    this.pane?.dispose();
  }
}
