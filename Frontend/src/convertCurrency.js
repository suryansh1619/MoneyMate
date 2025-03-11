const fetchExchangeRates = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR"); // Get INR-based rates
      const data = await response.json();
      return data.rates; // Returns exchange rates
    } 
    catch (error) {
      console.error("Error fetching exchange rates:", error);
      return null;
    }
  };
const convertCurrency = async (oldCurrency, newCurrency, amount) => {
  const rates = await fetchExchangeRates();
  if (!rates) return "Failed to fetch exchange rates.";
  const oldCurrencyCode = typeof oldCurrency === "object" ? oldCurrency.code : oldCurrency;
  const newCurrencyCode = typeof newCurrency === "object" ? newCurrency.code : newCurrency;
  const oldCurrencyToINR = rates[oldCurrencyCode] ;
  const newCurrencyToINR = rates[newCurrencyCode] ;

  if (!oldCurrencyToINR || !newCurrencyToINR) {
    return "Invalid currency provided.";
  }
  const amountInINR = amount/oldCurrencyToINR;
  const convertedAmount = amountInINR * newCurrencyToINR;
  return convertedAmount.toFixed(2); 
};

export default convertCurrency;
