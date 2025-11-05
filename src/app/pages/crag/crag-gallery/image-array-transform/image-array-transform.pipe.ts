import { Pipe, PipeTransform } from '@angular/core';
import { Image } from 'src/generated/graphql';
@Pipe({
  name: 'imageArrayTransform',
  standalone: true,
})
export class ImageArrayTransformPipe implements PipeTransform {
  transform(images: Image[], nrColumns: number, page: number): Image[] {
    const transformedImages: Image[] = [];
    for (let i = 0; i < images.length; i++) {
      if (i % nrColumns === page) {
        transformedImages.push(images[i]);
      }
    }
    return transformedImages;
  }
}
