// import { ProposalCard1 } from '@/components/card';
import { DeleteModal, ProposalModal1 } from '@/components/modal';
import { DashboardNavigation } from '@/components/navigation';
import { Pagination1 } from '@/components/pagination';

export default function ProposalInfo() {
  return (
    <>
      <div className='dashboard__content hover-bgc-color'>
        <div className='row pb40'>
          <div className='col-lg-12'>
            <DashboardNavigation />
          </div>
          <div className='col-lg-12'>
            <div className='dashboard_title_area'>
              <h2>My Proposals</h2>
              <p className='text'>Lorem ipsum dolor sit amet, consectetur.</p>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xl-12'>
            <div className='ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative'>
              <div className='packages_table table-responsive'>
                <table className='table-style3 table at-savesearch'>
                  <thead className='t-head'>
                    <tr>
                      <th scope='col'>Name</th>
                      <th scope='col'>Cost / Delivery</th>
                      <th scope='col'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='t-body'>
                    {/* {project1.slice(0, 7).map((item, i) => (
                      <ProposalCard1 key={i} data={item} />
                    ))} */}
                  </tbody>
                </table>
                <div className='mt30'>
                  <Pagination1 />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}
