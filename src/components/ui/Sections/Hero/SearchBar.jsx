import Search from "./Search";
import Dropdown from "./Dropdown";
import SearchButton from "./SearchButton";

export default function SearchBar({ categories }) {
  return (
    <div className="advance-search-tab bgc-white p10 bdrs4-sm bdrs60 banner-btn position-relative zi1 animate-up-3 mt30">
      <div className="row">
        <div className="col-md-5 col-lg-6 col-xl-6">
          <div className="advance-search-field mb10-sm">
            <Search />
          </div>
        </div>
        <div className="col-md-4 col-lg-4 col-xl-3">
          <div className="bselect-style1 bdrl1 bdrn-sm">
            <Dropdown categories={categories} />
          </div>
        </div>
        <div className="col-md-3 col-lg-2 col-xl-3">
          <div className="text-center text-xl-start">
            <SearchButton />
          </div>
        </div>
      </div>
    </div>
  );
}
