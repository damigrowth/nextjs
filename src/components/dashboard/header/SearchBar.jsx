export default function SearchBar() {
  return (
    <div className="ml40 d-none d-xl-block">
      <div className="search_area dashboard-style">
        <input
          type="text"
          className="form-control border-0"
          placeholder="Αναζήτηση..."
        />
        <label>
          <span className="flaticon-loupe" />
        </label>
      </div>
    </div>
  );
}
