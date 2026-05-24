import { calculateNetBalance, RawTransaction } from './balanceCalculator';

describe('calculateNetBalance', () => {
  it('should return 0 for an empty list of transactions', () => {
    const transactions: RawTransaction[] = [];
    const net = calculateNetBalance(transactions);
    expect(net).toBe(0);
  });

  it('should sum lent transactions as positive', () => {
    const transactions: RawTransaction[] = [
      { amount: 100, direction: 'lent' },
      { amount: 50.5, direction: 'lent' },
    ];
    const net = calculateNetBalance(transactions);
    expect(net).toBe(150.5);
  });

  it('should sum borrowed transactions as negative', () => {
    const transactions: RawTransaction[] = [
      { amount: 200, direction: 'borrowed' },
      { amount: 30, direction: 'borrowed' },
    ];
    const net = calculateNetBalance(transactions);
    expect(net).toBe(-230);
  });

  it('should compute correct net balance with both lent and borrowed transactions', () => {
    const transactions: RawTransaction[] = [
      { amount: 100, direction: 'lent' },
      { amount: 40, direction: 'borrowed' },
      { amount: 50, direction: 'lent' },
      { amount: 200, direction: 'borrowed' },
    ];
    // +100 -40 +50 -200 = -90
    const net = calculateNetBalance(transactions);
    expect(net).toBe(-90);
  });
});
