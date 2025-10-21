'use server';

import { redirect } from 'next/navigation';
import { Metadata } from 'next';

import { fetchEntity } from './fetch-entity';
import { formatTemplate } from './format-template';
import { MetaData } from './metadata';

/**
 * Entity type for SEO metadata generation
 */
type EntityType =
  | 'service'
  | 'profile'
  | 'serviceCategory'
  | 'serviceSubcategory'
  | 'serviceSubdivision'
  | 'proCategory'
  | 'proSubcategory';

interface MetaParams {
  type?: EntityType;
  params?: any;
  titleTemplate: string;
  descriptionTemplate: string;
  size?: number;
  url?: string;
  customUrl?: string;
}

interface MetaResponse {
  meta: Metadata;
}

export async function Meta({
  type,
  params,
  titleTemplate,
  descriptionTemplate,
  size = 150,
  url,
  customUrl,
}: MetaParams): Promise<MetaResponse> {
  try {
    if (type) {
      const { entity } = await fetchEntity(type, params);

      if (!entity) {
        redirect('/not-found');
      }

      const title = formatTemplate(titleTemplate, entity);
      const description = formatTemplate(descriptionTemplate, entity);
      const image = formatTemplate('%image%', entity);

      const { meta } = await MetaData({
        title,
        description,
        size,
        image,
        url: !url ? `${customUrl}/${entity.slug}` : url,
      });

      return { meta };
    } else {
      const { meta } = await MetaData({
        title: titleTemplate,
        description: descriptionTemplate,
        size,
        url: url || customUrl || '',
      });

      return { meta };
    }
  } catch (error: any) {
    console.error('Error fetching entity data:', error);
    redirect('/not-found');
  }
}
