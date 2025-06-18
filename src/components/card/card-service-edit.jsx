'use client';

import LinkNP from '@/components/link';
import { IconEye } from '@/components/icon/fa';

import ServiceCardFile from './card-service-file';
import ServiceCardFiles from './card-service-files';

export default function EditServiceCard({ service }) {
  const status =
    service.attributes.status.data.attributes.type === 'Active'
      ? 'Ενεργή'
      : 'Σε Παύση';

  const media = service.attributes.media?.data;

  return (
    <>
      <tr>
        <th className='dashboard-img-service' scope='row'>
          <div className='listing-style1 list-style d-block d-xl-flex align-items-start border-0 mb-0 shadow-none'>
            <div className='list-thumb flex-shrink-0 bdrs4 mb10-lg'>
              {media.length > 1 ? (
                <ServiceCardFiles
                  media={media.map((item) => item.attributes)}
                  path={`/dashboard/services/edit/${service.id}`}
                  height={91}
                  width={122}
                  fontSize={25}
                  isThumbnail={true}
                />
              ) : (
                <ServiceCardFile
                  file={media[0]?.attributes}
                  path={`/dashboard/services/edit/${service.id}`}
                  height={91}
                  width={122}
                />
              )}
            </div>
            <div className='list-content flex-grow-1 py-0 pl15 pl0-lg'>
              <h6 className='list-title mb-0'>
                <LinkNP href={`/dashboard/services/edit/${service.id}`}>
                  {service.attributes.title}
                </LinkNP>
                <LinkNP
                  href={`/s/${service.attributes.slug}`}
                  target='_blank'
                  className='ml10'
                >
                  <IconEye />
                </LinkNP>
              </h6>
            </div>
          </div>
        </th>
        <td className='align-top'>
          <span className='fz15 fw400' style={{ color: '#6c757d' }}>
            {`${
              service.attributes?.category?.data
                ? service.attributes.category.data.attributes.label + ' - '
                : ''
            }`}
            {`${
              service.attributes?.subcategory?.data
                ? service.attributes.subcategory.data.attributes.label + ' - '
                : ''
            }`}
            {`${
              service.attributes?.subdivision?.data
                ? service.attributes.subdivision.data.attributes.label
                : ''
            }`}
          </span>
        </td>
        <td className='align-top'>
          <span className='fz14 fw400' style={{ color: '#198754' }}>
            {status}
          </span>
        </td>
        <td className='align-top'>
          <div className='d-flex justify-content-end'>
            <LinkNP
              href={`/dashboard/services/edit/${service.id}`}
              className='icon'
              // id="edit"
              // data-bs-toggle="modal"
              // data-bs-target="#proposalModal"
            >
              <span className='flaticon-pencil' />
            </LinkNP>
          </div>
        </td>
      </tr>
    </>
  );
}
