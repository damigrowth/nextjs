import LinkNP from '@/components/link';

export default function PopularSearches({ subcategories }) {
  return (
    <>
      <p className='dark-color ff-heading mt30 mb15'>Δημοφιλείς Αναζητήσεις</p>
      <div className='home9-tags at-home12 d-md-flex align-items-center'>
        {subcategories.map((sub, i) => (
          <LinkNP
            href={`/ipiresies/${sub.slug}`}
            key={i}
            className='bdrs60 mb-md-0 searchbrd'
          >
            {sub.label}
          </LinkNP>
        ))}
      </div>
    </>
  );
}
