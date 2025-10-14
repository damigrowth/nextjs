'use client';

import React from 'react';
import { AdminDataTable } from './admin-data-table';
import { columnRenderers } from './table-columns/column-renderers';

interface TagItem {
  id: string;
  slug: string;
  label: string;
}

interface AdminTagsDataTableProps {
  data: TagItem[];
  loading?: boolean;
}

export function AdminTagsDataTable({ data, loading = false }: AdminTagsDataTableProps) {
  const basePath = '/admin/taxonomies/tags';

  const columns = [
    columnRenderers.id<TagItem>(),
    columnRenderers.label<TagItem>(basePath),
    columnRenderers.slug<TagItem>(),
    columnRenderers.actionsIcon<TagItem>(basePath),
  ];

  return <AdminDataTable data={data} columns={columns} loading={loading} basePath={basePath} />;
}
