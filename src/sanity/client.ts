import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId, readToken } from './env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // The CDN doesn't serve authenticated requests, so a token implies
  // hitting the API directly.
  useCdn: !readToken,
  perspective: 'published',
  token: readToken,
});
