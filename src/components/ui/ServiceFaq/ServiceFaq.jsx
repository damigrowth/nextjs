import useEditServiceStore from "@/store/service/edit/editServiceStore";
import FaqList from "./FaqList";
import NewFaqInputs from "./NewFaqInputs";
import useCreateServiceStore from "@/store/service/create/createServiceStore";

export default function ServiceFaq({ custom, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const { faq, showNewFaqInputs, handleShowNewFaqInputs } = store();

  return (
    <div
      className={
        !custom
          ? "ps-widget bdrs12 p30 mb50 overflow-hidden position-relative"
          : "ps-widget mb30 overflow-hidden position-relative"
      }
    >
      {!custom && (
        <div className="bdrb1 ">
          <h3 className="list-title">Ερωταπαντήσεις</h3>
          <p>
            Πρόσθεσε κάποιες πιθανές απορίες που έχουν συνήθως οι πελάτες <br />
            σχετικά με την υπηρεσία σου και τις απαντήσεις τους
          </p>
        </div>
      )}

      <div className={!custom ? "text-start mt30" : "text-start"}>
        <FaqList custom={custom} editMode={editMode} />
      </div>

      <button
        type="button"
        onClick={handleShowNewFaqInputs}
        className="ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
      >
        <span>Νέα Ερώτηση</span>
        <span className="d-flex align-items-center flaticon-button fz20" />
      </button>
      {showNewFaqInputs && <NewFaqInputs editMode={editMode} />}
      {/* Remove save button - saving will be handled by the Next button */}
    </div>
  );
}
