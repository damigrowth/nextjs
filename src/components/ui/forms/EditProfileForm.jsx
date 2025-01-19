import InputB from "@/components/inputs/InputB";
import ProfileImageInput from "@/components/inputs/ProfileImageInput";
import React from "react";

export default function EditProfileForm() {
  return (
    <form>
      <div className="ps-widget bdrs4 mb30 position-relative">
        <div className="form-style1">
          <div>
            <div className="bdrb1 pb15 mb25">
              <h5 className="list-title">Λογαριασμός</h5>
            </div>

            <ProfileImageInput />
            <div className="row">
              <div className="mb10 col-md-3">
                <InputB
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={"email"}
                  className="form-control input-group"
                  disabled={true}
                />
              </div>
              <div className="mb10 col-md-3">
                <InputB
                  label="Username"
                  id="username"
                  name="username"
                  type="text"
                  value={"domvournias"}
                  className="form-control input-group"
                  disabled={true}
                />
              </div>
              <div className="mb10 col-md-3">
                <InputB
                  label="Display Name"
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={"Kyriakos Vournias"}
                  className="form-control input-group"
                />
              </div>
              <div className="mb10 col-md-3">
                <InputB
                  label="Τηλέφωνο"
                  id="phone"
                  name="phone"
                  type="phone"
                  value={6949939998}
                  className="form-control input-group"
                />
              </div>
              <div className="mb10 col-md-4">
                <InputB
                  label="Διεύθυνση"
                  id="address"
                  name="address"
                  type="address"
                  value={"Αγίου Νικολάου 12, Αθήνα"}
                  className="form-control input-group"
                />
              </div>
            </div>
          </div>
          <div className="mt30">
            <div className="bdrb1 pb15 mb25">
              <h5 className="list-title">Προφίλ</h5>
            </div>
            {/* Να εμφανίζονται τα παρακάτω όταν το role → freelancer 

O freelancer να επιλέγει με switch buttons το visibility “Εμφάνιση στο Προφίλ” για email - phone - address (οι employers άλλωστε δεν έχουν profile page)

rate

tagline

description

coverage 
-- online True/False 
-- onbase True/False 
-- onsite True/False / if True then select areas

skills / specializations (όπως τα tags και το πρώτα να είναι το specialization)

commencement 

website

social links

size (όταν είναι Company)

minBudgets

industries

contactTypes

payment_methods

settlement_methods

portfolio images

terms */}
          </div>
        </div>

        {/* Submit Button */}
      </div>
    </form>
  );
}
