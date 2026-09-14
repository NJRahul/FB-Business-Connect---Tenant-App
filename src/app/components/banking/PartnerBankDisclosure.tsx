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
      FB Business Connect Banking services are provided by Evolve Bank &amp; Trust, Member FDIC. FB Business Connect is not a bank.
      Business deposit accounts are FDIC insured up to $250,000 per depositor, per insured bank.
      Debit cards are issued by Evolve Bank &amp; Trust pursuant to a license from Visa U.S.A. Inc.
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
