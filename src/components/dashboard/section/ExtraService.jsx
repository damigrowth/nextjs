import ServiceDetailExtra1 from "@/components/element/ServiceDetailExtra1";

export default function ExtraService() {
  return (
    <>
      <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 ">
          <h3 className="list-title">Πρόσθετα</h3>
        </div>
        <div className="col-xl-8">
          <ServiceDetailExtra1 />
        </div>
      </div>
    </>
  );
}
