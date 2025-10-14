'use client';

import React from 'react';
import { AdminDataTable } from './admin-data-table';
import { columnRenderers } from './table-columns/column-renderers';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

interface SkillItem {
  id: string;
  slug: string;
  label: string;
  category?: string;
}

interface AdminSkillsDataTableProps {
  data: SkillItem[];
  loading?: boolean;
}

export function AdminSkillsDataTable({ data, loading = false }: AdminSkillsDataTableProps) {
  const basePath = '/admin/taxonomies/skills';

  const columns = [
    columnRenderers.id<SkillItem>(),
    columnRenderers.label<SkillItem>(basePath),
    columnRenderers.slug<SkillItem>(),
    columnRenderers.categoryLookup<SkillItem>('category', proTaxonomies),
    columnRenderers.actionsIcon<SkillItem>(basePath),
  ];

  return <AdminDataTable data={data} columns={columns} loading={loading} basePath={basePath} />;
}
