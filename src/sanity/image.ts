import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

import { dataset, projectId } from './env';

const builder = createImageUrlBuilder({ projectId: projectId!, dataset });

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
