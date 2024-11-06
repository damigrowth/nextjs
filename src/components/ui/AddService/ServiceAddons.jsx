import useCreateServiceStore from "@/store/service/createServiceStore";
import NewAddonInputs from "../ServiceAddons/NewAddonInputs";
import AddonsList from "../ServiceAddons/AddonsList";

export default function ServiceAddons() {
  const { addons, saveAddons, showNewAddonInputs, handleShowNewAddonInputs } =
    useCreateServiceStore();

  return (
    <div className="ps-widget bdrs12 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 ">
        <h3 className="list-title">Πρόσθετα</h3>
      </div>
      <div className="text-start mt30">
        <button
          type="button"
          onClick={handleShowNewAddonInputs}
          className="ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
        >
          <span>Νέο Πρόσθετο</span>
          <span className="d-flex align-items-center flaticon-button fz20" />
        </button>
        {showNewAddonInputs && <NewAddonInputs />}
        <AddonsList />
      </div>
      <button
        type="button"
        className="ud-btn btn-thm mt20 no-rotate"
        disabled={addons.length === 0}
        onClick={saveAddons}
      >
        Αποθήκευση
        <i className="fa-solid fa-floppy-disk"></i>
      </button>
    </div>
  );
}
