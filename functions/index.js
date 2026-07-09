const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendRsvpEmail = functions.firestore
    .document("rsvps/{email}")
    .onWrite(async (change, context) => {
      const data = change.after.data();

      if (!data) return null;

      const mailOptions = {
        from: `"Hari & Neetha Wedding" <${functions.config().gmail.email}>`,
        to: data.email,
        subject: "RSVP Confirmation - Hari & Neetha Wedding",
        html: `
        <h2>Thank you, ${data.name} ❤️</h2>
        <p>We received your RSVP.</p>

        <h3>Your RSVP Details</h3>
        <ul>
          <li>Sangeet Night: ${data.preludeAttending ? `Yes - ${data.preludeGuests} guest(s)` : "No"}</li>
          <li>Haldi & Engagement: ${data.haldiAttending ? `Yes - ${data.haldiGuests} guest(s)` : "No"}</li>
          <li>Wedding Ceremony: ${data.weddingAttending ? `Yes - ${data.weddingGuests} guest(s)` : "No"}</li>
        </ul>

        <p>We can’t wait to celebrate with you!</p>
        <p>With love,<br/>Hari & Neetha</p>
      `,
      };

      return transporter.sendMail(mailOptions);
    });
