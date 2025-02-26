const { sendEmail } = require('./utils/emailService'); // Remplacez par le chemin correct

async function testSendEmail() {
  try {
    const to = 'taha.bellotef@esprit.tn'; // Remplacez par votre adresse e-mail
    const subject = 'Test d\'envoi d\'e-mail';
    const text = 'Ceci est un test d\'envoi d\'e-mail depuis le backend.';

    console.log("Envoi de l'e-mail...");
    await sendEmail(to, subject, text);
    console.log("E-mail envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
  }
}

testSendEmail();