import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'stringOrJson',
  standalone: true
})
export class StringOrJsonPipe implements PipeTransform {
  public transform(value: unknown): string {
    if(value === null || value === undefined) {
      return ''
    } else if(typeof value === 'string') {
      return value
    } else {
      return JSON.stringify(value)
    }
  }
}
