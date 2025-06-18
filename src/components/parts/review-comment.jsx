import { UserImage } from '@/components/avatar';
import { timeAgo } from '@/utils/timeAgo';
import { IconStar } from '@/components/icon/fa';

export default function ReviewComment({
  i,
  length,
  reviewer,
  rating,
  comment,
  publishedAt,
}) {
  const time = timeAgo(publishedAt);

  return (
    <>
      <div className={`pb20 ${i + 1 !== length ? 'bdrb1' : ''}`}>
        <div className='mbp_first position-relative d-sm-flex align-items-center justify-content-start mb30-sm mt30'>
          <UserImage
            firstName={reviewer?.firstName}
            lastName={reviewer?.lastName}
            displayName={reviewer?.displayName}
            hideDisplayName
            image={reviewer?.image?.formats?.thumbnail?.url}
            alt={
              reviewer?.image?.formats?.thumbnail?.provider_metadata?.public_id
            }
            width={60}
            height={60}
            path={`/profile/${reviewer?.username}`}
          />
          <div className='ml20 ml0-xs mt20-xs'>
            <h6 className='mt-0 mb-1'>{reviewer?.displayName}</h6>
            <div className='d-flex align-items-center'>
              <div>
                <IconStar className='vam fz10 review-color me-2' />
                <span className='fz15 fw500'>{rating}</span>
              </div>
              <div className='ms-3'>
                <span className='fz14 text'>Δημοσιεύτηκε {time}</span>
              </div>
            </div>
          </div>
        </div>
        <p className='text mt20 mb20'>{comment}</p>
        {/* <LinkNP href="/service-single" className="ud-btn bgc-thm4 text-thm">
          Respond
        </LinkNP> */}
      </div>
    </>
  );
}
