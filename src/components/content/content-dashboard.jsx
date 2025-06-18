import LinkNP from '@/components/link';

import { getData } from '@/lib/client/operations';
import {
  ALL_REVIEWS_RECEIVED_DASHBOARD,
  ALL_SERVICES_DASHBOARD,
  POPULAR_SERVICES_DASHBOARD,
} from '@/lib/graphql';

import DraftServices from '../heading/title-dashboard-services-draft';
import DashboardNavigation from '../navigation/navigation-dashboard';
import { getAccess } from '@/actions/shared/user';
import { getFreelancer } from '@/actions/shared/freelancer';
import { ArrowRightLong } from '@/components/icon/fa';

export default async function DashboardInfo() {
  const hasAccess = await getAccess(['freelancer', 'company']);

  const freelancer = await getFreelancer();

  const freelancerId = freelancer?.id;
  const freelancerDisplayName = freelancer?.displayName;

  let data = {};

  if (hasAccess) {
    const { services } = await getData(ALL_SERVICES_DASHBOARD, {
      id: freelancerId,
    });

    const { reviews } = await getData(ALL_REVIEWS_RECEIVED_DASHBOARD, {
      id: freelancerId,
    });

    const popularServices = await getData(POPULAR_SERVICES_DASHBOARD, {
      id: freelancerId,
    });

    data = {
      services,
      reviews,
      popularServices,
      totalServices: services?.meta?.pagination?.total || 0,
      totalReviews: reviews?.meta?.pagination?.total || 0,
    };
  }

  return (
    <>
      <div className='dashboard__content hover-bgc-color'>
        <div className='row pb40'>
          <div className='col-lg-12'>
            <DashboardNavigation />
          </div>
          <div className='col-lg-12'>
            <div className='dashboard_title_area'>
              {hasAccess ? (
                <div>
                  <h2>Πίνακας Ελέγχου</h2>
                  <DraftServices />
                </div>
              ) : (
                <h2>Καλώς ήρθες, {freelancerDisplayName}!</h2>
              )}
            </div>
          </div>
        </div>
        {hasAccess ? (
          <>
            <div className='row'>
              <div className='col-sm-6 col-xxl-3'>
                <div className='d-flex align-items-center justify-content-between statistics_funfact'>
                  <div className='details'>
                    <div className='fz15'>Υπηρεσίες</div>
                    <div className='title'>{data?.totalServices}</div>
                    {/* <div className="text fz14">
                  <span className="text-thm">10</span> New Offered
                </div> */}
                  </div>
                  <div className='icon text-center'>
                    <i className='flaticon-contract' />
                  </div>
                </div>
              </div>
              <div className='col-sm-6 col-xxl-3'>
                <div className='d-flex align-items-center justify-content-between statistics_funfact'>
                  <div className='details'>
                    <div className='fz15'>Αξιολογήσεις</div>
                    <div className='title'>{data?.totalReviews}</div>
                    {/* <div className="text fz14">
                  <span className="text-thm">290+</span> New Review
                </div> */}
                  </div>
                  <div className='icon text-center'>
                    <i className='flaticon-review-1' />
                  </div>
                </div>
              </div>
            </div>
            <div className='row'>
              {/* <div className="col-md-6 col-xxl-4">
                <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
                  <div className="d-flex justify-content-between bdrb1 pb15 mb20">
                    <h5 className="title">Δημοφιλείς Υπηρεσίες</h5>
                    <LinkNP
                      href="/dashboard/services"
                      className="text-decoration-underline text-thm6"
                    >
                      Περισσότερα
                    </LinkNP>
                  </div>
                  {data?.popularServices.services.data.length > 0 ? (
                    <div className="dashboard-img-service">
                      {data?.popularServices.services.data.map((item, i) => (
                        <div key={i}>
                          <MostViewServiceCard1 data={item} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-img-service">
                      <p>Δεν βρέθηκαν δημοφιλέις υπηρεσίες</p>
                    </div>
                  )}
                </div>
              </div> */}
              <div className='col-md-6 col-xxl-4'>
                <div className='ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative'>
                  <div className='d-flex justify-content-between bdrb1 pb15 mb30'>
                    <h5 className='title'>Συντομεύσεις</h5>
                  </div>
                  <div className='d-grid gap-3'>
                    <LinkNP
                      href='/dashboard/profile'
                      className='ud-btn btn-thm2 mb25 me-4'
                    >
                      Διαχείριση Προφίλ
                      <ArrowRightLong />
                    </LinkNP>
                    <LinkNP
                      href='/dashboard/services/add'
                      className='ud-btn btn-thm2 mb25 me-4'
                    >
                      Προσθήκη Υπηρεσίας
                      <ArrowRightLong />
                    </LinkNP>
                    <LinkNP
                      href='/dashboard/services'
                      className='ud-btn btn-thm2 mb25 me-4'
                    >
                      Διαχείριση Υπηρεσιών
                      <ArrowRightLong />
                    </LinkNP>
                  </div>
                </div>
              </div>
              <div className='col-md-6 col-xxl-4'>
                <div className='ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative'>
                  <div className='d-flex justify-content-between bdrb1 pb15 mb30'>
                    <h5 className='title'>Τελευταία Μηνύματα</h5>
                    <a className='text-decoration-underline text-thm6'>
                      Περισσότερα (Σύντομα)
                    </a>
                  </div>
                  <div className='dashboard-img-service'>
                    {/* {job1.slice(0, 3).map((item, i) => (
                  <div key={i}>
                    <RecentServiceCard1 data={item} />
                    {product1.slice(0, 3).length !== i + 1 && (
                      <hr className="opacity-100 mt-0" />
                    )}
                  </div>
                ))} */}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            Μπορείς να συμπληρώσεις τα στοιχεία σου στην{' '}
            <strong>
              <LinkNP href='/dashboard/profile'>Διαχείριση Προφίλ </LinkNP>
            </strong>
            . <br />
            Ακόμα, μπορείς να αποθηκεύσεις τις Αγαπημένες σου υπηρεσίες και τα
            προφίλ. <br />
            Εάν έχεις έρθει σε επικοινωνία με κάποιον επαγγελματία, μη διστάσεις
            να υποβάλεις μια αξιολόγηση. <br />
            Θα βοηθήσεις έτσι, και άλλους χρήστες να βρουν αυτό που ψάχνουν!
            <div className='d-flex pb30 gap-3 mt-4 flex-wrap'>
              <LinkNP href='/ipiresies' className='ud-btn btn-thm2 mb25 me-4'>
                Όλες οι Υπηρεσίες
                <ArrowRightLong />
              </LinkNP>
              <LinkNP href='/pros' className='ud-btn btn-thm2 mb25 me-4'>
                Επαγγελματίες
                <ArrowRightLong />
              </LinkNP>
              <LinkNP href='/companies' className='ud-btn btn-thm2 mb25 me-4'>
                Επιχειρήσεις
                <ArrowRightLong />
              </LinkNP>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
