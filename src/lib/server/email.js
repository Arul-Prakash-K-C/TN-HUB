import net from 'node:net';
import tls from 'node:tls';
import { env } from '$env/dynamic/private';

function readSmtpConfig() {
  const host = env.SMTP_HOST?.trim();
  const from = env.SMTP_FROM?.trim() || env.MAIL_FROM?.trim();
  if (!host || !from) {
    return null;
  }

  const port = Number(env.SMTP_PORT ?? (env.SMTP_SECURE === 'true' ? 465 : 587));
  const secure = env.SMTP_SECURE === 'true' || port === 465;
  const user = env.SMTP_USER?.trim() || '';
  const password = env.SMTP_PASSWORD ?? '';
  const name = env.SMTP_NAME?.trim() || 'TN Hub';

  return { host, port, secure, user, password, from, name };
}

function connectSocket({ host, port, secure }) {
  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host, port, servername: host }, () => resolve(socket))
      : net.createConnection({ host, port }, () => resolve(socket));

    socket.setEncoding('utf8');
    socket.on('error', reject);
  });
}

function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
    };
    const onError = (cause) => {
      cleanup();
      reject(cause);
    };
    const onData = (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!/^\d{3}[ -]/.test(line)) {
          continue;
        }
        if (line[3] === ' ') {
          cleanup();
          resolve({ code: Number(line.slice(0, 3)), line });
          return;
        }
      }
    };

    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function smtpCommand(socket, command, expectedCodes) {
  socket.write(`${command}\r\n`);
  const response = await readResponse(socket);
  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP command failed: ${command.split(' ')[0]} (${response.line})`);
  }
  return response;
}

function base64(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function formatHeaderValue(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function buildMessage({ fromName, fromEmail, toEmail, subject, text }) {
  return [
    `From: ${formatHeaderValue(`${fromName} <${fromEmail}>`)}`,
    `To: ${formatHeaderValue(toEmail)}`,
    `Subject: ${formatHeaderValue(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text.replace(/\r?\n/g, '\r\n')
  ].join('\r\n');
}

function dotStuff(body) {
  return body
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n');
}

export async function sendMail({ to, subject, text }) {
  if (typeof to !== 'string' || !to.trim()) {
    return { sent: false, skipped: true, reason: 'No recipient email address was provided.' };
  }

  const config = readSmtpConfig();
  if (!config) {
    return { sent: false, skipped: true, reason: 'SMTP is not configured.' };
  }

  const socket = await connectSocket(config);
  try {
    const greeting = await readResponse(socket);
    if (greeting.code !== 220) {
      throw new Error(`SMTP server rejected connection: ${greeting.line}`);
    }

    await smtpCommand(socket, `EHLO ${env.SMTP_HELO?.trim() || 'localhost'}`, [250]);

    if (config.user) {
      await smtpCommand(socket, 'AUTH LOGIN', [334]);
      await smtpCommand(socket, base64(config.user), [334]);
      await smtpCommand(socket, base64(config.password), [235]);
    }

    await smtpCommand(socket, `MAIL FROM:<${config.from}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await smtpCommand(socket, 'DATA', [354]);

    const message = buildMessage({
      fromName: config.name,
      fromEmail: config.from,
      toEmail: to,
      subject,
      text
    });

    socket.write(`${dotStuff(message)}\r\n.\r\n`);
    const dataResponse = await readResponse(socket);
    if (dataResponse.code !== 250) {
      throw new Error(`SMTP message delivery failed: ${dataResponse.line}`);
    }

    await smtpCommand(socket, 'QUIT', [221]);
    return { sent: true, skipped: false };
  }
  finally {
    socket.destroy();
  }
}
