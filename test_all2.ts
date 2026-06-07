const p = 1200000;
const rate = 11.4;
const years = 5;
const n = years * 12;
const r = (rate / 12) / 100;

console.log("Searching for EMI...");

for (let emi = 26330.50; emi <= 26331.50; emi += 0.001) {
  let balance = p;
  let totalInterest = 0;
  for (let m = 1; m <= n; m++) {
    const interest = Math.round(balance * r * 100) / 100;
    let principalPaid = emi - interest;
    if (m === n) {
      principalPaid = balance;
    } else {
      principalPaid = Math.round(principalPaid * 100) / 100;
    }
    totalInterest += interest;
    balance -= principalPaid;
  }
  if (Math.abs(totalInterest - 379856.68) < 0.02) {
    console.log(`Found! EMI = ${emi.toFixed(4)}, Total Interest = ${totalInterest.toFixed(2)}, balance = ${balance.toFixed(2)}`);
  }
}

console.log("Searching with unrounded principal:");
for (let emi = 26330.50; emi <= 26331.50; emi += 0.001) {
  let balance = p;
  let totalInterest = 0;
  for (let m = 1; m <= n; m++) {
    const interest = Math.round(balance * r * 100) / 100;
    let principalPaid = emi - interest;
    if (m === n) {
      principalPaid = balance;
    }
    totalInterest += interest;
    balance -= principalPaid;
  }
  if (Math.abs(totalInterest - 379856.68) < 0.02) {
    console.log(`Found (unrounded principal)! EMI = ${emi.toFixed(4)}, Total Interest = ${totalInterest.toFixed(2)}, balance = ${balance.toFixed(2)}`);
  }
}
