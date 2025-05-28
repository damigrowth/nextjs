import React from 'react';

import PackagesBtns from './service-packages-buttons';

export default function Packages({ packages }) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <div className='px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1'>
      <h4>Πακέτα</h4>
      <div className='table-style2 table-responsive bdr1 mt30 mb60'>
        <table className='table table-borderless mb-0'>
          <thead className='t-head'>
            <tr>
              <th className='col ' scope='col' />
              {packages.map((pack) => (
                <th key={pack.id} className='col w25' scope='col'>
                  <span className='h2'>{pack.price}€</span>
                  <br />
                  <span className='h4'>{pack.title}</span>
                  <br />
                  <span className='text'>{pack.description}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='t-body'>
            {packages[0].features.map((feature, featureIndex) => (
              <tr className='bgc-thm3' key={featureIndex}>
                <th scope='row'>{feature.title}</th>
                {packages.map((pack, index) => (
                  <td key={index}>
                    {pack.features[featureIndex].isCheckField ? (
                      <div
                        className={
                          pack.features[featureIndex].checked
                            ? 'check_circle bgc-thm'
                            : 'check_circle bgc-red'
                        }
                      >
                        <span
                          className={
                            pack.features[featureIndex].checked
                              ? 'fas fa-check'
                              : 'fas fa-times'
                          }
                        />
                      </div>
                    ) : (
                      pack.features[featureIndex].value
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <PackagesBtns packages={packages} />
          </tbody>
        </table>
      </div>{' '}
    </div>
  );
}
