import { ChangeDetectorRef, inject, NgZone, OnDestroy, Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'beautifySeconds',
  standalone: true,
  pure: false,
})
export class BeautifySecondsPipe implements PipeTransform, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly ngZone = inject(NgZone)
  private timeoutId: ReturnType<typeof setTimeout> | number | undefined

  public transform(startTime: Date | undefined,): string {
    clearTimeout(this.timeoutId)
    const passedSeconds = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000) : 0

    const minutes = Math.floor((passedSeconds > 0 ? passedSeconds : 0) / 60)
    const seconds = passedSeconds % 60

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          try {
            this.cdr.detectChanges()
          } catch (_ignored) { /* NOOP */ }
        })
      }, 1000)
    })

    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
  }

  public ngOnDestroy(): void {
    clearTimeout(this.timeoutId)
  }
}
