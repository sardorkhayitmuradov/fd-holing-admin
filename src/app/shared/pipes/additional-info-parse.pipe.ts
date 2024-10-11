import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'additionalInfoParser',
})
export class AdditionalInfoParsePipe implements PipeTransform {

  public transform(value: string | undefined): string {
    if (!value) return '';

    const entityTypeMap: { [key: string]: string } = {
      'YUR': 'Юридическое лицо',
      'FIZ': 'Физическое лицо',
      'Ru': 'Русский язык',
      'Uz': 'Узбекский язык',
      'En': 'Английский язык'
    };

    return value.split(/[^a-zA-Z]/g)
      .map((text: string) => {
        if (entityTypeMap[text]) {
          return entityTypeMap[text];
        }

        return text
      })
      .join(' ')
  }
}
