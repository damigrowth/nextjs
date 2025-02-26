import useCreateServiceStore from "@/store/service/create/createServiceStore";
import NewAddonInputs from "../ServiceAddons/NewAddonInputs";
import AddonsList from "../ServiceAddons/AddonsList";
import useEditServiceStore from "@/store/service/edit/editServiceStore";

export default function ServiceAddons({ custom, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const { addons, saveAddons, showNewAddonInputs, handleShowNewAddonInputs } =
    store();

  return (
    <div
      className={
        !custom
          ? "ps-widget bdrs12 p30 mb30 overflow-hidden position-relative"
          : "ps-widget mb30 overflow-hidden position-relative"
      }
    >
      {!custom && (
        <div className="bdrb1 ">
          <h3 className="list-title">Πρόσθετες Υπηρεσίες</h3>
          <p>
            Πρόσθεσε επιπλέον παροχές που συνδέονται με τη συγκεκριμένη υπηρεσία
            <br />
            και θα προστεθούν στο συνολικό κόστος της υπηρεσίας που προσφέρεις.
          </p>
        </div>
      )}
      <div className={!custom ? "text-start mt30" : "text-start mb30"}>
        {!custom && (
          <button
            type="button"
            onClick={handleShowNewAddonInputs}
            className="ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
          >
            <span>Νέο Πρόσθετο</span>
            <span className="d-flex align-items-center flaticon-button fz20" />
          </button>
        )}

        {!custom && showNewAddonInputs && (
          <NewAddonInputs editMode={editMode} />
        )}
        <AddonsList custom={custom} editMode={editMode} />
      </div>
      {custom && (
        <button
          type="button"
          onClick={handleShowNewAddonInputs}
          className="ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
        >
          <span>Νέο Πρόσθετο</span>
          <span className="d-flex align-items-center flaticon-button fz20" />
        </button>
      )}

      {custom && showNewAddonInputs && <NewAddonInputs editMode={editMode} />}
      {!custom && (
        <button
          type="button"
          className="ud-btn btn-thm mt20 no-rotate"
          disabled={addons.length === 0}
          onClick={saveAddons}
        >
          Αποθήκευση
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
      )}
    </div>
  );
}
