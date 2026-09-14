export function PartnerBankDisclosure() {
  return (
    <div
      style={{
        borderTop: '1px solid #E5E7EB',
        background: '#F9FAFB',
        padding: '12px 24px',
        fontSize: '0.6875rem',
        color: '#9CA3AF',
        lineHeight: 1.6,
        flexShrink: 0,
      }}
    >
      <strong style={{ color: '#6B7280' }}>Partner Bank Disclosure:</strong>{' '}
      FB Business Connect Banking services are provided by our partner bank, registered and regulated by the South African Reserve Bank (SARB). FB Business Connect is not a bank.
      Business deposit accounts are protected under the South African Deposit Insurance Scheme (DIS) up to R100,000 per depositor.
      Debit cards are issued by our partner bank pursuant to a licence from Visa International.
      Use of business accounts and cards is subject to the{' '}
      <span style={{ color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}>
        Deposit Account Agreement
      </span>{' '}
      and{' '}
      <span style={{ color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}>
        Cardholder Agreement
      </span>
      . FB Business Connect is a financial technology company, not a bank.
    </div>
  );
}
