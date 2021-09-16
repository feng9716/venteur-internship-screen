import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import api from "../services/service";

const GENDER = ["male", "female"];
const SMOKER = ["nonsmoker", "smoker"];

class Home extends React.Component {
  constructor() {
    super();

    this.onCheckZip = this.onCheckZip.bind(this);
    this.onPropertyChange = this.onPropertyChange.bind(this);
    this.onQuote = this.onQuote.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
  }

  state = {
    form: {
      zip: "",
      zipCountyId: "",
      county: "",
      age: 0,
      gender: GENDER[0],
      smoker: SMOKER[0],
    },
    quotes: [],
    selected: [],

    enrolled: false,
  };

  // When the button is clicked, the form object in state will be updated
  onPropertyChange = (e) => {
    e.preventDefault();

    const form = { ...this.state.form };
    const field = e.target.id;

    form[field] = e.target.value;

    this.setState({
      form,
    });
  };
  // Get the county from the zip entered by user
  onCheckZip = (e) => {
    e.preventDefault();

    const zip = this.state.form["zip"];
    api
      .getZipCounty(zip)
      .then((response) => {
        const form = { ...this.state.form };
        form["zipCountyId"] = response.data[0]["id"];
        form["county"] = response.data[0]["county"];
        this.setState({
          form,
        });

        // console.log(this.state.form.county);
      })
      .catch((err) => alert(`unknown zipcode: ${zip}`));
  };

  onQuote = (e) => {
    e.preventDefault();

    api
      .getQuote(this.state.form)
      .then((response) => {
        const quotes = response.data;
        this.setState({ quotes, selected: quotes });
      })
      .catch((err) => {
        alert(`Information invalid`);
      });

    // console.log(this.state.quotes);
  };

  onUpdate = (e) => {
    e.preventDefault();
    if (this.state.quotes.length === 0) {
      alert("please request quotes first");
      return;
    }
    const term = document.getElementById("term").value;
    const min = document.getElementById("minBenefitAmount").value;
    const max = document.getElementById("maxBenefitAmount").value;

    const picked = [];

    for (let quote of this.state.quotes) {
      if (
        quote.term === term &&
        quote.minBenefitAmount >= min &&
        quote.maxBenefitAmount <= max
      ) {
        picked.push(quote);
      }
    }

    this.setState({
      selected: picked,
    });
  };

  onEnroll = (e, quote) => {
    e.preventDefault();

    const product = {};
    product["age"] = this.state.form.age;
    product["gender"] = this.state.form.gender;
    product["smoker"] = this.state.form.smoker;
    product["zipCountyId"] = this.state.form.zipCountyId;
    product["policyId"] = quote.id;
    product["benefitAmount"] = quote.benefitAmount;
    console.log(product);
    // api.enroll(product);

    api
      .enroll(product)
      .then(() => {
        alert("enroll successfully");
        this.setState({
          enrolled: true,
        });
      })
      .catch((e) => {
        if (e.response.status === 400) alert("enroll failed");
        return;
      });
  };

  render() {
    return (
      <div>
        <form action="">
          <div className="row mt-5">
            <div className="col">
              <label htmlFor="" id="zip">
                Zipcode:
              </label>
              <input
                type="text"
                id="zip"
                onChange={(e) => this.onPropertyChange(e)}
                placeholder="5 digit zipcode"
              />
            </div>
            <div className="col">
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => this.onCheckZip(e)}
              >
                Check County
              </button>
            </div>
            <div className="col">
              <label htmlFor="" id="county">
                County:
              </label>
              <input type="text" id="county" value={this.state.form.county} />
            </div>
          </div>

          <div className="row m-5">
            <div className="col-3">
              <label htmlFor="" id="gender">
                Gender:
              </label>
              <select
                name="gender"
                id="gender"
                onChange={(e) => this.onPropertyChange(e)}
              >
                <option value={GENDER[0]}>male</option>
                <option value={GENDER[1]}>female</option>
              </select>
            </div>

            <div className="col">
              <label htmlFor="" id="age">
                Age({`>=`}18 yrs):
              </label>
              <input
                type="number"
                id="age"
                onChange={(e) => this.onPropertyChange(e)}
              />
            </div>

            <div className="col">
              <label htmlFor="" id="smoker">
                Smoker:
              </label>
              <select
                name="smoker"
                id="smoker"
                onChange={(e) => this.onPropertyChange(e)}
              >
                <option value={SMOKER[0]}>nonsmoker</option>
                <option value={SMOKER[1]}>smoker</option>
              </select>
            </div>

            <div className="col-2">
              <button className="btn btn-primary btn-sm" onClick={this.onQuote}>
                Quote
              </button>
            </div>
          </div>
        </form>

        <div className="row m-5">
          <div className="col-3">
            <label htmlFor="" id="">
              Term:
            </label>
            <select name="term" id="term">
              <option value="Years10">10 Years</option>
              <option value="Years20">20 Years</option>
              <option value="Years30">30 Years</option>
              <option value="WholeLife">Whole Life</option>
            </select>
          </div>
          <div className="col">
            <label htmlFor="" id="">
              Minimum Benefit(0-1000000):
            </label>
            <input
              type="number"
              id="minBenefitAmount"
              min="0"
              max="100000"
              step="10000"
            />
          </div>
          <div className="col">
            <label htmlFor="" id="">
              Maximum Benefit(0-1000000):
            </label>
            <input
              type="number"
              id="maxBenefitAmount"
              min="0"
              max="1000000"
              step="10000"
            />
          </div>
          <div className="col-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={(e) => this.onUpdate(e)}
            >
              Update
            </button>
          </div>
        </div>

        <table className="table table-hover table-bordered table-striped">
          <thead>
            <tr>
              <th>Carrier Name</th>
              <th>Term</th>
              <th>Min Benefit Amount</th>
              <th>Max Benefit Amout</th>
              <th>Premium Rate</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {this.state.selected.map((quote) => (
              <tr>
                <td>{quote.carrierName}</td>
                <td>{quote.term}</td>
                <td>{quote.minBenefitAmount}</td>
                <td>{quote.maxBenefitAmount}</td>
                <td>{quote.annualPremiumRate}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) => {
                      this.onEnroll(e, quote);
                    }}
                  >
                    Enroll
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Home;
