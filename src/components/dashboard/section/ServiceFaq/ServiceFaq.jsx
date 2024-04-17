import FaqList from "./FaqList";
import NewFaqInputs from "./NewFaqInputs";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function ServiceFaq() {
  const { saveFaq, showNewFaqInputs, handleShowNewFaqInputs } =
    useCreateServiceStore();

  return (
    <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 ">
        <h3 className="list-title">Συχνές Ερωτήσεις</h3>
      </div>
      <div className="text-start mt30">
        <button
          type="button"
          onClick={handleShowNewFaqInputs}
          className="ud-btn btn-thm2 bdrs4 d-flex align-items-center gap-2 default-box-shadow p3"
        >
          <span>Νέα Ερώτηση</span>
          <span className="d-flex align-items-center flaticon-button fz20" />
        </button>
        {showNewFaqInputs && <NewFaqInputs />}
        <FaqList />
      </div>
      <button
        type="button"
        className="ud-btn btn-thm mt20 no-rotate"
        onClick={saveFaq}
      >
        Αποθήκευση
        <i className="fa-solid fa-floppy-disk"></i>
      </button>
    </div>
  );
}
