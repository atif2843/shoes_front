import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey( process.env.NEXT_PUBLIC_SENDGRID_API_KEY ); // Store in .env

const sendVerificationEmail = async ( email, name ) =>
{
    const msg = {
        to: email,
        from: "no-reply@yourdomain.com",
        subject: "Verify Your Email",
        html: `
      <p>Hi ${ name },</p>
      <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
      <a href="https://yourdomain.com/verify-email?email=${ email }">Verify Email</a>
      <p>Best Regards,<br>Your Team</p>
    `,
    };

    try
    {
        await sendgrid.send( msg );
        console.log( "Verification email sent to:", email );
    } catch ( error )
    {
        console.error( "Error sending email:", error );
    }
};

export default sendVerificationEmail;
