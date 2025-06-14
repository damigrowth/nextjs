import { Pagination1 } from '@/components/pagination';
import { invoice } from '@/constants/dashboard';

import InvoiceCard1 from '../card/card-invoice';
import DashboardNavigation from '../navigation/navigation-dashboard';
import { IconMagnifyingGlass } from '@/components/icon/fa';

export default function InvoiceInfo() {
  return (
    <>
      <div className='dashboard__content hover-bgc-color'>
        <div className='row pb40'>
          <div className='col-lg-12'>
            <DashboardNavigation />
          </div>
        </div>
        <div className='row align-items-center justify-content-between pb40'>
          <div className='col-xl-4'>
            <div className='dashboard_title_area'>
              <h2>Invoice</h2>
              <p className='text'>Lorem ipsum dolor sit amet, consectetur.</p>
            </div>
          </div>
          <div className='col-xl-4'>
            <div className='dashboard_search_meta'>
              <div className='search_area'>
                <input
                  type='text'
                  className='form-control bdrs4'
                  placeholder='Search Invoice'
                />
                <label>
                  <IconMagnifyingGlass className='icon-magnifying-glass' />
                </label>
              </div>
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
                      <th scope='col'>Invoice ID</th>
                      <th scope='col'>Purchase Date</th>
                      <th scope='col'>Amount</th>
                      <th scope='col'>Payment Status</th>
                      <th scope='col'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='t-body'>
                    {invoice.map((item, i) => (
                      <InvoiceCard1 key={i} data={item} />
                    ))}
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
    </>
  );
}
