interface SendEmailParams {
  senderEmail: string;
  refreshToken: string;
  recipientEmail: string;
  subject: string;
  body: string;
}

/**
 * Refreshes Google OAuth access token using the stored refresh token.
 */
async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET env variables not configured.');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Google access token: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Sends an email using the Google Gmail API.
 */
export async function sendGmail({
  senderEmail,
  refreshToken,
  recipientEmail,
  subject,
  body,
}: SendEmailParams): Promise<{ messageId: string }> {
  const accessToken = await refreshGoogleAccessToken(refreshToken);

  // Construct MIME Message (RFC 822)
  const mimeParts = [
    `From: ${senderEmail}`,
    `To: ${recipientEmail}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'Mime-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ];
  const mimeMessage = mimeParts.join('\r\n');

  // Base64URL encode the MIME message
  const encodedMessage = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API send failed: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return { messageId: data.id };
}

/**
 * Refreshes Microsoft OAuth access token.
 */
async function refreshMicrosoftAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.MICROSOFT_OAUTH_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('MICROSOFT_OAUTH_CLIENT_ID or MICROSOFT_OAUTH_CLIENT_SECRET env variables not configured.');
  }

  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Microsoft access token: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Sends an email using the Microsoft Graph API.
 */
export async function sendOutlook({
  senderEmail,
  refreshToken,
  recipientEmail,
  subject,
  body,
}: SendEmailParams): Promise<{ messageId: string }> {
  const accessToken = await refreshMicrosoftAccessToken(refreshToken);

  const requestBody = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: recipientEmail,
          },
        },
      ],
    },
    saveToSentItems: 'true',
  };

  const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Microsoft Graph API send failed: ${res.status} - ${errText}`);
  }

  // Graph sendMail responds with 202 Accepted on success and empty body. We fetch client-request-id if needed or return a dummy success string
  const requestId = res.headers.get('client-request-id') || 'outlook-success';
  return { messageId: requestId };
}

/**
 * Unified sender mapping to handle either provider dynamically.
 */
export async function sendEmail(provider: string, params: SendEmailParams) {
  if (provider.toLowerCase() === 'gmail') {
    return sendGmail(params);
  } else if (provider.toLowerCase() === 'outlook') {
    return sendOutlook(params);
  } else {
    throw new Error(`Unsupported email provider: ${provider}`);
  }
}
