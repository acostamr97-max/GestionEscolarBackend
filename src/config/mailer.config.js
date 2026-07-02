import { ENVIRONMENT } from "./environment.config.js";
import { Resend } from 'resend';


const resend = new Resend(ENVIRONMENT.RESEND_API_KEY);

const FROM_POR_DEFECTO = 'Gestion Escolar <onboarding@resend.dev>';

const mailer_transport = {
    
    async sendMail({ to, from, subject, html }) {
        const { data, error } = await resend.emails.send({
            from: from || FROM_POR_DEFECTO,
            to,
            subject,
            html
        });

        if (error) {
            throw new Error(error.message || 'Error al enviar el mail con Resend');
        }

        return data;
    }
};

export default mailer_transport;
