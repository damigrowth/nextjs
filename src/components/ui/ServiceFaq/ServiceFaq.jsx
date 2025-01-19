import FaqList from "./FaqList";
import NewFaqInputs from "./NewFaqInputs";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function ServiceFaq({ custom }) {
  const { faq, saveFaq, showNewFaqInputs, handleShowNewFaqInputs } =
    useCreateServiceStore();

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
          <h3 className="list-title">Ερωτοαπαντήσεις</h3>
          <p>
            Πρόσθεσε κάποιες πιθανές απορίες που έχουν συνήθως οι πελάτες <br />
            σχετικά με την υπηρεσία σου και τις απαντήσεις τους
          </p>
        </div>
      )}

      <div className={!custom ? "text-start mt30" : "text-start"}>
        <FaqList custom={custom} />
      </div>

      <button
        type="button"
        onClick={handleShowNewFaqInputs}
        className="ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
      >
        <span>Νέα Ερώτηση</span>
        <span className="d-flex align-items-center flaticon-button fz20" />
      </button>
      {showNewFaqInputs && <NewFaqInputs />}
      {!custom && (
        <button
          type="button"
          className="ud-btn btn-thm mt20 no-rotate"
          disabled={faq.length === 0}
          onClick={saveFaq}
        >
          Αποθήκευση
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
      )}
    </div>
  );
}
