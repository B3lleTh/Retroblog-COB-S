const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Envía el OTP de 6 dígitos al email del usuario recién registrado.
 *
 * IMPORTANTE para free tier de Resend:
 * - Sin dominio verificado solo puedes enviar al email con el que
 *   te registraste en resend.com.
 * - El from debe ser exactamente 'onboarding@resend.dev'
 * - Cuando tengas un dominio propio verificado en Resend, cambia
 *   el from a algo como 'noreply@tudominio.com'
 */
const sendVerificationEmail = async (email, name, code) => {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Tu código de verificación',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#09090b;font-family:system-ui,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="max-width:440px;background:#111113;border:1px solid #1f1f23;
                       border-radius:12px;padding:40px 36px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;
                               color:#3b82f6;letter-spacing:0.1em;text-transform:uppercase;">
                      Blog Platform
                    </p>
                    <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;
                                color:#f4f4f5;letter-spacing:-0.02em;">
                      Hola, ${name}
                    </h1>
                    <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.6;">
                      Usa el siguiente código para verificar tu cuenta. 
                      Expira en <strong style="color:#a1a1aa;">15 minutos</strong>.
                    </p>

                    <div style="background:#09090b;border:1px solid #1f1f23;
                                border-radius:10px;padding:28px;text-align:center;
                                margin-bottom:28px;">
                      <p style="margin:0 0 8px;font-size:11px;color:#52525b;
                                 letter-spacing:0.08em;text-transform:uppercase;">
                        Código de verificación
                      </p>
                      <p style="margin:0;font-size:40px;font-weight:700;
                                 letter-spacing:12px;color:#f4f4f5;
                                 font-variant-numeric:tabular-nums;">
                        ${code}
                      </p>
                    </div>

                    <p style="margin:0;font-size:12px;color:#3f3f46;line-height:1.6;">
                      Si no creaste una cuenta en Blog Platform, ignora este mensaje.
                      Nadie más puede usar este código.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  })

  if (error) {
    console.error('[Resend] Error enviando email:', error)
    throw new Error('EMAIL_SEND_FAILED')
  }

  return data
}

module.exports = { sendVerificationEmail }