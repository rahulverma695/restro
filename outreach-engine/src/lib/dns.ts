import dns from 'dns';

const { resolveTxt, resolveMx } = dns.promises;

export interface DNSReport {
  spf: { valid: boolean; record: string; error?: string };
  dmarc: { valid: boolean; record: string; error?: string };
  mx: { valid: boolean; records: string[]; error?: string };
  dkim?: { valid: boolean; record: string; error?: string };
}

/**
 * Checks DNS records for SPF, DMARC, MX, and optionally DKIM keys for a domain.
 */
export async function checkDomainDNS(
  domain: string,
  dkimSelector?: string
): Promise<DNSReport> {
  const report: DNSReport = {
    spf: { valid: false, record: '' },
    dmarc: { valid: false, record: '' },
    mx: { valid: false, records: [] },
  };

  // 1. Verify SPF Record
  try {
    const txtRecords = await resolveTxt(domain);
    const spfRecord = txtRecords
      .flat()
      .find((record) => record.startsWith('v=spf1'));
    
    if (spfRecord) {
      report.spf.valid = spfRecord.includes('include:') || spfRecord.includes('redirect=') || spfRecord.includes('ip4:') || spfRecord.includes('ip6:');
      report.spf.record = spfRecord;
    } else {
      report.spf.error = 'No SPF record found starting with v=spf1';
    }
  } catch (err: any) {
    report.spf.error = err.message || 'Failed to query TXT records';
  }

  // 2. Verify DMARC Record (Checks _dmarc.domain)
  try {
    const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = dmarcRecords
      .flat()
      .find((record) => record.startsWith('v=DMARC1'));
    
    if (dmarcRecord) {
      // DMARC is valid if it starts with v=DMARC1 and specifies policy (p=none, p=quarantine, or p=reject)
      report.dmarc.valid = dmarcRecord.includes('p=none') || dmarcRecord.includes('p=quarantine') || dmarcRecord.includes('p=reject');
      report.dmarc.record = dmarcRecord;
    } else {
      report.dmarc.error = 'No DMARC record found starting with v=DMARC1';
    }
  } catch (err: any) {
    report.dmarc.error = err.message || 'Failed to query _dmarc records';
  }

  // 3. Verify MX Records
  try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      report.mx.valid = true;
      report.mx.records = mxRecords
        .sort((a, b) => a.priority - b.priority)
        .map((record) => `${record.exchange} (Priority: ${record.priority})`);
    } else {
      report.mx.error = 'No MX records found for email receipt';
    }
  } catch (err: any) {
    report.mx.error = err.message || 'Failed to query MX records';
  }

  // 4. Verify DKIM (if selector provided)
  if (dkimSelector) {
    report.dkim = { valid: false, record: '' };
    try {
      const dkimRecords = await resolveTxt(`${dkimSelector}._domainkey.${domain}`);
      const dkimRecord = dkimRecords.flat().find((record) => record.startsWith('v=DKIM1') || record.startsWith('k=rsa'));
      
      if (dkimRecord) {
        report.dkim.valid = true;
        report.dkim.record = dkimRecord;
      } else {
        report.dkim.error = `No DKIM record found at selector ${dkimSelector}`;
      }
    } catch (err: any) {
      report.dkim.error = err.message || `Failed to resolve DKIM selector ${dkimSelector}`;
    }
  }

  return report;
}
