import { PILLARS } from '@/data/taxonomy';
import { ARTICLES } from '@/data/articles';
import { AUTHORS } from '@/data/authors';
import type { Article, Author, BreadcrumbItem, Pillar, Topic } from '@/types/content';
import { routes } from './routes';

export function getAllPillars(): Pillar[] {
  return PILLARS;
}

export function getPillarBySlug(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}

export function getAllTopics(): Topic[] {
  return PILLARS.flatMap((p) =>
    p.branches.flatMap((b) => b.topics)
  );
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return getAllTopics().find((t) => t.slug === slug);
}

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByPillar(pillarSlug: string): Article[] {
  return ARTICLES.filter((a) => a.pillarSlug === pillarSlug);
}

export function getArticlesByTopic(topicSlug: string): Article[] {
  return ARTICLES.filter((a) => a.topicSlug === topicSlug);
}

export function getArticlesByBranch(branchSlug: string): Article[] {
  return ARTICLES.filter((a) => a.branchSlug === branchSlug);
}

export function getAllAuthors(): Author[] {
  return AUTHORS;
}

export function getAuthorById(id: string): Author | undefined {
  return AUTHORS.find((a) => a.id === id);
}

export function getBreadcrumbForArticle(article: Article): BreadcrumbItem[] {
  const pillar = getPillarBySlug(article.pillarSlug);
  const branch = pillar?.branches.find((b) => b.slug === article.branchSlug);
  const topic = branch?.topics.find((t) => t.slug === article.topicSlug);

  const crumbs: BreadcrumbItem[] = [
    { label: 'Knowledge library', href: routes.taxonomy() },
  ];

  if (pillar) {
    crumbs.push({ label: pillar.title, href: routes.pillar(pillar.slug) });
  }

  if (topic) {
    crumbs.push({ label: topic.title, href: routes.topic(topic.slug) });
  }

  crumbs.push({ label: article.title, href: routes.article(article.slug) });

  return crumbs;
}

export function getPillarForArticle(article: Article): Pillar | undefined {
  return getPillarBySlug(article.pillarSlug);
}

// ─── Build-time content validation ───────────────────────────────────────────

const COMPLIANCE_PILLAR_SLUGS = [
  'governance-ethics-compliance',
  'international-regulation-comparative',
];

function articleTouchesRegulation(article: Article): boolean {
  return (
    COMPLIANCE_PILLAR_SLUGS.includes(article.pillarSlug) ||
    !!article.complianceBox ||
    article.type === 'Legal briefing'
  );
}

export function validateArticle(article: Article): string[] {
  const violations: string[] = [];

  if (articleTouchesRegulation(article)) {
    if (!article.reviewer) {
      violations.push(`${article.slug}: requires a reviewer (regulatory content)`);
    }
    if (!article.complianceBox) {
      violations.push(`${article.slug}: requires a complianceBox (regulatory content)`);
    }
  }

  if (article.type === 'Practitioner framework' || article.type === 'Playbook') {
    if (!article.keyFramework) {
      violations.push(`${article.slug}: ${article.type} requires keyFramework`);
    }
  }

  if (article.type === 'Prompt pack') {
    if (!article.promptPack?.length) {
      violations.push(`${article.slug}: Prompt pack requires promptPack`);
    }
  }

  if (!article.authorId) {
    violations.push(`${article.slug}: missing authorId`);
  }

  return violations;
}

export function validateAllContent(): void {
  const allViolations = ARTICLES.flatMap(validateArticle);
  if (allViolations.length > 0) {
    throw new Error(
      `Content validation failed:\n${allViolations.map((v) => `  • ${v}`).join('\n')}`
    );
  }
}
