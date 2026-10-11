import { and, asc, count, desc, eq, inArray, like, or, type SQL } from 'drizzle-orm';
import type {
  AdminShowcaseListQuery,
  CreateShowcaseInput,
  UpdateShowcaseInput,
} from '@arunreah/shared';
import { imagePresentations, showcaseRelated, showcaseSections, showcases } from '../db/schema';
import type { DatabaseClient } from '../db/client';
import { atomicBatch, type AtomicBatchStatement } from '../db/transaction';
import { upsertStatement } from './image-presentation.repository';

function toShowcaseRow(input: UpdateShowcaseInput) {
  const {
    sections: _sections,
    relatedShowcaseIds: _relatedShowcaseIds,
    summaryEn,
    summaryKm,
    coverImagePresentation: _coverImagePresentation,
    ...row
  } = input;
  void _sections;
  void _relatedShowcaseIds;
  void _coverImagePresentation;
  return {
    ...row,
    ...(summaryEn !== undefined ? { excerptEn: summaryEn } : {}),
    ...(summaryKm !== undefined ? { excerptKm: summaryKm } : {}),
  };
}

function toCreatedShowcaseRow(input: CreateShowcaseInput) {
  const {
    sections: _sections,
    relatedShowcaseIds: _relatedShowcaseIds,
    summaryEn,
    summaryKm,
    coverImagePresentation: _coverImagePresentation,
    ...row
  } = input;
  void _sections;
  void _relatedShowcaseIds;
  void _coverImagePresentation;
  return { ...row, excerptEn: summaryEn, excerptKm: summaryKm };
}

export async function findShowcaseById(database: DatabaseClient, id: string) {
  const [showcase] = await database.select().from(showcases).where(eq(showcases.id, id)).limit(1);
  return showcase;
}

export async function findShowcaseBySlug(database: DatabaseClient, slug: string) {
  const [showcase] = await database
    .select()
    .from(showcases)
    .where(eq(showcases.slug, slug))
    .limit(1);
  return showcase;
}

export async function findPublicShowcaseBySlug(database: DatabaseClient, slug: string) {
  const [showcase] = await database
    .select()
    .from(showcases)
    .where(and(eq(showcases.slug, slug), eq(showcases.status, 'PUBLISHED')))
    .limit(1);
  return showcase;
}

export async function createShowcase(database: DatabaseClient, input: CreateShowcaseInput) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const statements: [AtomicBatchStatement, ...AtomicBatchStatement[]] = [
    database
      .insert(showcases)
      .values({ id, ...toCreatedShowcaseRow(input), createdAt: now, updatedAt: now }),
  ];
  statements.push(
    ...replaceSectionStatements(database, id, input.sections, []),
    ...replaceRelatedShowcaseStatements(database, id, input.relatedShowcaseIds),
  );
  if (input.coverImagePresentation)
    statements.push(
      upsertStatement(
        database,
        { ownerType: 'SHOWCASE', ownerId: id, slot: 'PRIMARY' },
        input.coverImagePresentation,
      ),
    );
  await atomicBatch(database, statements);
  return findShowcaseById(database, id);
}

export async function updateShowcase(
  database: DatabaseClient,
  id: string,
  input: UpdateShowcaseInput,
) {
  const row = toShowcaseRow(input);
  const previousSections =
    input.sections === undefined
      ? []
      : await database
          .select({ id: showcaseSections.id })
          .from(showcaseSections)
          .where(eq(showcaseSections.showcaseId, id));
  const statements: AtomicBatchStatement[] = [];
  if (Object.keys(row).length > 0)
    statements.push(
      database
        .update(showcases)
        .set({ ...row, updatedAt: new Date().toISOString() })
        .where(eq(showcases.id, id)),
    );
  if (input.sections !== undefined)
    statements.push(
      ...replaceSectionStatements(
        database,
        id,
        input.sections,
        previousSections.map(({ id: ownerId }) => ownerId),
      ),
    );
  if (input.relatedShowcaseIds !== undefined)
    statements.push(...replaceRelatedShowcaseStatements(database, id, input.relatedShowcaseIds));
  if (input.coverImagePresentation)
    statements.push(
      upsertStatement(
        database,
        { ownerType: 'SHOWCASE', ownerId: id, slot: 'PRIMARY' },
        input.coverImagePresentation,
      ),
    );
  if (statements.length)
    await atomicBatch(database, statements as [AtomicBatchStatement, ...AtomicBatchStatement[]]);
  return findShowcaseById(database, id);
}

function replaceSectionStatements(
  database: DatabaseClient,
  showcaseId: string,
  sections: CreateShowcaseInput['sections'],
  previousOwnerIds: string[],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [];
  if (previousOwnerIds.length)
    statements.push(
      database
        .delete(imagePresentations)
        .where(
          and(
            eq(imagePresentations.ownerType, 'SHOWCASE_SECTION'),
            inArray(imagePresentations.ownerId, previousOwnerIds),
          ),
        ),
    );
  statements.push(
    database.delete(showcaseSections).where(eq(showcaseSections.showcaseId, showcaseId)),
  );
  if (sections.length > 0) {
    const now = new Date().toISOString();
    const rows = sections.map(({ imagePresentation, ...section }) => ({
      imagePresentation,
      row: { id: crypto.randomUUID(), showcaseId, ...section, createdAt: now, updatedAt: now },
    }));
    statements.push(database.insert(showcaseSections).values(rows.map(({ row }) => row)));
    for (const { imagePresentation, row } of rows) {
      if (imagePresentation && row.imageKey)
        statements.push(
          upsertStatement(
            database,
            { ownerType: 'SHOWCASE_SECTION', ownerId: row.id, slot: 'PRIMARY' },
            imagePresentation,
          ),
        );
    }
  }
  return statements;
}

function replaceRelatedShowcaseStatements(
  database: DatabaseClient,
  showcaseId: string,
  relatedShowcaseIds: string[],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    database.delete(showcaseRelated).where(eq(showcaseRelated.showcaseId, showcaseId)),
  ];
  if (relatedShowcaseIds.length > 0) {
    const now = new Date().toISOString();
    statements.push(
      database.insert(showcaseRelated).values(
        relatedShowcaseIds.map((relatedShowcaseId, displayOrder) => ({
          id: crypto.randomUUID(),
          showcaseId,
          relatedShowcaseId,
          displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }
  return statements;
}

export async function getSections(database: DatabaseClient, showcaseId: string) {
  return database
    .select()
    .from(showcaseSections)
    .where(eq(showcaseSections.showcaseId, showcaseId))
    .orderBy(asc(showcaseSections.displayOrder));
}

export async function getRelatedShowcases(database: DatabaseClient, showcaseId: string) {
  return database
    .select({ relation: showcaseRelated, showcase: showcases })
    .from(showcaseRelated)
    .innerJoin(showcases, eq(showcaseRelated.relatedShowcaseId, showcases.id))
    .where(eq(showcaseRelated.showcaseId, showcaseId))
    .orderBy(asc(showcaseRelated.displayOrder));
}

export async function showcasesExist(database: DatabaseClient, ids: string[]) {
  if (ids.length === 0) return [];
  return database.select({ id: showcases.id }).from(showcases).where(inArray(showcases.id, ids));
}

export async function deleteShowcase(database: DatabaseClient, id: string) {
  const sectionIds = await database
    .select({ id: showcaseSections.id })
    .from(showcaseSections)
    .where(eq(showcaseSections.showcaseId, id));
  await atomicBatch(database, [
    database.delete(imagePresentations).where(
      or(
        and(eq(imagePresentations.ownerType, 'SHOWCASE'), eq(imagePresentations.ownerId, id)),
        sectionIds.length
          ? and(
              eq(imagePresentations.ownerType, 'SHOWCASE_SECTION'),
              inArray(
                imagePresentations.ownerId,
                sectionIds.map((item) => item.id),
              ),
            )
          : undefined,
      ),
    ),
    database
      .delete(showcaseRelated)
      .where(or(eq(showcaseRelated.showcaseId, id), eq(showcaseRelated.relatedShowcaseId, id))),
    database.delete(showcaseSections).where(eq(showcaseSections.showcaseId, id)),
    database.delete(showcases).where(eq(showcases.id, id)),
  ]);
}

function buildFilters(query: AdminShowcaseListQuery): SQL | undefined {
  const conditions: SQL[] = [];
  if (query.status) conditions.push(eq(showcases.status, query.status));
  if (query.showOnHomepage !== undefined) {
    conditions.push(eq(showcases.showOnHomepage, query.showOnHomepage));
  }
  if (query.category) conditions.push(eq(showcases.categoryEn, query.category));
  if (query.search) {
    const search = `%${query.search}%`;
    conditions.push(
      or(
        like(showcases.titleEn, search),
        like(showcases.titleKm, search),
        like(showcases.categoryEn, search),
        like(showcases.categoryKm, search),
        like(showcases.slug, search),
      )!,
    );
  }
  return conditions.length === 0 ? undefined : and(...conditions);
}

export async function listAdminShowcases(database: DatabaseClient, query: AdminShowcaseListQuery) {
  const where = buildFilters(query);
  const columns = {
    title: showcases.titleEn,
    displayOrder: showcases.displayOrder,
    createdAt: showcases.createdAt,
    updatedAt: showcases.updatedAt,
  } as const;
  const direction = query.order === 'desc' ? desc : asc;
  const [items, total] = await Promise.all([
    database
      .select()
      .from(showcases)
      .where(where)
      .orderBy(direction(columns[query.sort]), asc(showcases.id))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
    database.select({ value: count() }).from(showcases).where(where),
  ]);
  return { items, total: total[0]?.value ?? 0 };
}

export async function listPublicShowcases(database: DatabaseClient, homepageOnly = false) {
  return database
    .select()
    .from(showcases)
    .where(
      homepageOnly
        ? and(eq(showcases.status, 'PUBLISHED'), eq(showcases.showOnHomepage, true))
        : eq(showcases.status, 'PUBLISHED'),
    )
    .orderBy(asc(showcases.displayOrder), asc(showcases.id));
}
