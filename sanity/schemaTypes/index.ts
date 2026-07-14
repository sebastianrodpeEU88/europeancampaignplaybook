import { type SchemaTypeDefinition } from 'sanity';

import author from './author';
import pillar from './pillar';
import branch from './branch';
import topic from './topic';
import article from './article';
import event from './event';

export const schemaTypes: SchemaTypeDefinition[] = [author, pillar, branch, topic, article, event];
