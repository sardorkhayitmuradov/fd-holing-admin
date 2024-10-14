import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "textMask",
  standalone: true,
})
export class TextMaskPipe implements PipeTransform {
  public transform(
    value: string,
    afterHideCharacter: number | undefined = 20
  ): string {
    if (!value || value.length <= afterHideCharacter) {
      return value;
    }

    const visiblePart = value.substring(0, afterHideCharacter);
    const maskedPart = "...";

    return visiblePart + maskedPart;
  }
}

