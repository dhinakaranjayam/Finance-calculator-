const p = 1200000;
const rate = 11.4;
const years = 5;
const n = years * 12;

console.log("Target EMI: 26330.94");
console.log("Target Interest: 379856.68");
console.log("Target Total: 1579856.68");

// Let's test standard reducing where we do NOT reassign balance at the end, or where we adjust differently
function testVariation(precision: number, method: string) {
  let r = (rate / 12) / 100;
  let emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  
  if (method === 'ceil') emi = Math.ceil(emi * 100) / 100;
  if (method === 'floor') emi = Math.floor(emi * 100) / 100;
  if (method === 'round') emi = Math.round(emi * 100) / 100;
  if (method === 'raw') {} // use raw emi

  let balance = p;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let m = 1; m <= n; m++) {
    let interestPaid = balance * r;
    if (precision === 2) {
      interestPaid = Math.round(interestPaid * 100) / 100;
    } else if (precision === 4) {
      interestPaid = Math.round(interestPaid * 10000) / 10000;
    }
    
    let principalPaid = emi - interestPaid;
    if (precision === 2) {
      principalPaid = Math.round(principalPaid * 100) / 100;
    }
    
    if (m === n) {
      principalPaid = balance;
      // emi = interestPaid + principalPaid;
    }
    
    totalInterest += interestPaid;
    totalPrincipal += principalPaid;
    balance -= principalPaid;
  }
  
  const totalPaid = emi * n; // if we assume flat monthly payment
  const actualPaidFromSchedule = totalInterest + totalPrincipal;
  
  console.log(`Method=${method}, Precision=${precision}:`);
  console.log(`  EMI: ${emi.toFixed(4)}, TotalPaid (emi * n): ${totalPaid.toFixed(2)}, Actual sum: ${actualPaidFromSchedule.toFixed(2)}, Total Interest: ${totalInterest.toFixed(2)}`);
}

testVariation(2, 'raw');
testVariation(2, 'round');
testVariation(2, 'ceil');
testVariation(2, 'floor');
testVariation(0, 'raw');
testVariation(0, 'round');

// What if the formula is:
// Total Interest Paid = Sum of (Remaining Principal * Rate / 12) rounded each month
// Let's try simulating the schedule with a fixed EMI or solve for EMI that gives exactly 379856.68 total interest
for (let emi = 26330.90; emi <= 26331.00; emi += 0.01) {
  let balance = p;
  let totalInterest = 0;
  for (let m = 1; m <= n; m++) {
    const interest = Math.round(balance * r_val() * 100) / 100;
    let principalPaid = Math.round((emi - interest) * 100) / 100;
    if (m === n) {
      principalPaid = balance;
    }
    totalInterest += interest;
    balance -= principalPaid;
  }
  if (Math.abs(totalInterest - 379856.68) < 1.0) {
    console.log(`Found near interest match with EMI ${emi.toFixed(2)}: Total Interest = ${totalInterest.toFixed(2)} [Diff: ${(totalInterest - 379856.68).toFixed(2)}]`);
  }
}

function r_val() {
  return (rate / 12) / 100;
}
