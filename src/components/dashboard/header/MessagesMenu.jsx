export default function MessagesMenu() {
  return (
    <li className="d-none d-sm-block">
      <a
        className="text-center mr5 text-thm2 dropdown-toggle fz20"
        type="button"
        data-bs-toggle="dropdown"
      >
        <span className="flaticon-mail" />
      </a>
      {/* Currently commented out in original code */}
      {/* <MessagesDropdown /> */}
    </li>
  );
}
