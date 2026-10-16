
const form = document.getElementById("currency-form");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const result = document.getElementById("result");
const fromFlag = document.getElementById("from-flag");
const toFlag = document.getElementById("to-flag");
const swapButton = document.getElementById("swap");
const submitButton = form.querySelector(".btn");

const countryCodes = {
  USD: "US",
  INR: "IN",
  EUR: "EU",
  GBP: "GB",
  AUD: "AU",
  CAD: "CA",
  JPY: "JP",
  SGD: "SG",
  AED: "AE"
};

function updateFlags() {
  const fromCode = countryCodes[fromSelect.value];
  const toCode = countryCodes[toSelect.value];

  fromFlag.src = `https://flagsapi.com/${fromCode}/flat/64.png`;
  toFlag.src = `https://flagsapi.com/${toCode}/flat/64.png`;

  fromFlag.alt = `${fromSelect.value} flag`;
  toFlag.alt = `${toSelect.value} flag`;
}

async function convertCurrency(event) {
  if (event) {
    event.preventDefault();
  }

  const amount = Number(amountInput.value);
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;

  if (amountInput.value.trim() === "" ||
    !Number.isFinite(amount) || amount < 0) {
    result.textContent = "Please enter a valid amount.";
    return;
  }

  if (fromCurrency === toCurrency) {
    result.textContent =
      `${amount} ${fromCurrency} = ${amount.toLocaleString(
        "en-US", { maximumFractionDigits: 4 }
      )} ${toCurrency}`;
    return;
  }

  result.textContent = "Getting latest available exchange rate...";
  submitButton.disabled = true;

  try {
    const url =
      `https://open.er-api.com/v6/latest/${fromCurrency}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not connect to exchange-rate service.");
    }

    const data = await response.json();

    if (data.result !== "success" ||
      !data.rates ||
      typeof data.rates[toCurrency] !== "number") {
      throw new Error("Exchange rate is not available.");
    }

    const rate = data.rates[toCurrency];
    const convertedAmount = amount * rate;

    result.textContent =
      `${amount.toLocaleString("en-US")} ${fromCurrency} = ` +
      `${convertedAmount.toLocaleString("en-US", {
        maximumFractionDigits: 4
      })} ${toCurrency}`;

  } catch (error) {
    console.error("Currency conversion error:", error);
    result.textContent =
      "Unable to get exchange rate. Check your internet and try again.";
  } finally {
    submitButton.disabled = false;
  }
}

form.addEventListener("submit", convertCurrency);

fromSelect.addEventListener("change", () => {
  updateFlags();
  convertCurrency();
});

toSelect.addEventListener("change", () => {
  updateFlags();
  convertCurrency();
});

amountInput.addEventListener("input", () => {
  if (amountInput.value !== "") {
    convertCurrency();
  }
});

swapButton.addEventListener("click", () => {
  const previousFrom = fromSelect.value;

  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;

  updateFlags();
  convertCurrency();
});

updateFlags();
convertCurrency();
