'use client';

import React from 'react';
import { AdminDataTable } from './admin-data-table';
import { columnRenderers } from './table-columns/column-renderers';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { DatasetItem } from '@/lib/types/datasets';

interface AdminSkillsDataTableProps {
  data: DatasetItem[];
  loading?: boolean;
}

export function AdminSkillsDataTable({
  data,
  loading = false,
}: AdminSkillsDataTableProps) {
  const basePath = '/admin/taxonomies/skills';

  const columns = [
    columnRenderers.id<DatasetItem>(),
    columnRenderers.label<DatasetItem>(basePath),
    columnRenderers.slug<DatasetItem>(),
    columnRenderers.categoryLookup<DatasetItem>('category', proTaxonomies),
    columnRenderers.actionsIcon<DatasetItem>(basePath),
  ];

  return (
    <AdminDataTable
      data={data}
      columns={columns}
      loading={loading}
      basePath={basePath}
    />
  );
}
