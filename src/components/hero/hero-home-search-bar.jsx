// import Dropdown from "./Dropdown";

import { SearchButton } from '../button';
import { Search } from '../form';

export default function SearchBar({ categories }) {
  return (
    <div className='advance-search-tab searchaki bgc-white p10 bdrs4-sm bdrs60 searchbrd banner-btn position-relative zi1 animate-up-3 mt30'>
      <div className='row'>
        <div className='col-md-6 col-lg-8 col-xl-8'>
          <div className='advance-search-field mb10-sm'>
            <Search />
          </div>
        </div>
        {/* <div className="col-md-4 col-lg-4 col-xl-3">
          <div className="bselect-style1 bdrl1 bdrn-sm">
            <Dropdown categories={categories} />
          </div>
        </div> */}
        <div className='col-md-6 col-lg-4 col-xl-4'>
          <div className='text-center text-xl-start h-100'>
            <SearchButton />
          </div>
        </div>
      </div>
    </div>
  );
}
