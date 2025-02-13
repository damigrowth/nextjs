import { getFreelancer } from "@/lib/users/freelancer";
import AccountForm from "../../forms/EditProfile/AccountForm";
import AdditionalInfoForm from "../../forms/EditProfile/AdditionalInfoForm";
import BasicInfoForm from "../../forms/EditProfile/BasicInfoForm";
import BillingDetailsForm from "../../forms/EditProfile/BillingDetailsForm";
import PresentationForm from "../../forms/EditProfile/PresentationForm";
import Tab from "./Tab";
import TabNavigation from "./TabNavigation";
import TabWrapper from "./TabWrapper";

export async function TabContent() {
  const freelancer = await getFreelancer();
  const type = freelancer.type.data.attributes.slug;

  const tabs = [
    {
      index: 0,
      label: "Λογαριασμός",
      content: <AccountForm freelancer={freelancer} />,
    },
    {
      index: 1,
      label: "Βασικά Στοιχεία",
      content: <BasicInfoForm freelancer={freelancer} type={type} />,
    },

    {
      index: type !== "user" ? 2 : null,
      label: type !== "user" ? "Παρουσίαση" : null,
      content: type !== "user" ? <PresentationForm /> : null,
    },
    {
      index: 3,
      label: "Πρόσθετα Στοιχεία",
      content: <AdditionalInfoForm />,
    },
    {
      index: 4,
      label: "Στοιχεία Τιμολόγησης",
      content: <BillingDetailsForm />,
    },
  ];

  return (
    <div className="navtab-style1">
      <TabWrapper>
        <TabNavigation tabs={tabs.map((tab) => tab.label)} />
        <div className="tab-content">
          {tabs.map((tab) => (
            <Tab key={tab.index} index={tab.index} content={tab.content} />
          ))}
        </div>
      </TabWrapper>
    </div>
  );
}
