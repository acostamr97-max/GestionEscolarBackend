import { ENVIRONMENT } from "./environment.config.js";
import { Resend } from 'resend';

/* ============================================================================
   Configuracion del envio de mails con RESEND.

   Por que Resend y no Gmail/SMTP: Railway (en los planes que no son Pro) bloquea
   las conexiones SMTP salientes, asi que Gmail no funciona en el despliegue.
   Resend envia los mails a traves de una API HTTPS (no SMTP), que Railway si
   permite. Por eso migramos a este servicio.

   Necesita una variable de entorno:
     - RESEND_API_KEY: la clave que da Resend al crear la cuenta.

   El "from" (remitente):
     - Mientras no verifiquemos un dominio propio en Resend, hay que usar el
       remitente de prueba que Resend habilita: 'onboarding@resend.dev'.
     - Con ese remitente de prueba, Resend SOLO deja enviar mails a la casilla
       con la que te registraste en Resend (limitacion de la cuenta gratis sin
       dominio). Para enviar a cualquier destinatario hay que verificar un
       dominio y cambiar el FROM por uno de ese dominio.

   IMPORTANTE - misma interfaz que antes:
   Para no tener que tocar los lugares que ya mandan mails (register,
   forgotPassword, aviso de entrevista), exponemos un objeto con el mismo
   metodo 'sendMail({ to, from, subject, html })' que usaba nodemailer.
   Por dentro, ese metodo llama a Resend.
   ============================================================================ */

const resend = new Resend(ENVIRONMENT.RESEND_API_KEY);

/* Remitente por defecto. Si algun dia verifican un dominio, cambian esto por
   algo como 'Gestion Escolar <no-reply@tudominio.com>'. */
const FROM_POR_DEFECTO = 'Gestion Escolar <onboarding@resend.dev>';

const mailer_transport = {
    /* Mantiene la misma firma que nodemailer: recibe { to, from, subject, html }.
       El 'from' es opcional; si no viene, usa el remitente por defecto. */
    async sendMail({ to, from, subject, html }) {
        const { data, error } = await resend.emails.send({
            from: from || FROM_POR_DEFECTO,
            to,
            subject,
            html
        });

        /* Si Resend devuelve un error, lo lanzamos para que el que llamo se entere
           (igual que hacia nodemailer al fallar). */
        if (error) {
            throw new Error(error.message || 'Error al enviar el mail con Resend');
        }

        return data;
    }
};

export default mailer_transport;
