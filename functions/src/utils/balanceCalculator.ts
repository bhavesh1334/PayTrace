export interface RawTransaction {
  amount: number;
  direction: 'lent' | 'borrowed';
}

export function calculateNetBalance(transactions: RawTransaction[]): number {
  let balance = 0;
  for (const tx of transactions) {
    if (tx.direction === 'lent') {
      balance += tx.amount;
    } else if (tx.direction === 'borrowed') {
      balance -= tx.amount;
    }
  }
  return balance;
}
