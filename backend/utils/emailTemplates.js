function createEmailTemplate({
  // Branding
  companyName = 'Parkit',
  companyLogo = 'https://drive.google.com/uc?export=view&id=1hYiYnwo9GrDfF7lT-bvaDbRKabeNJr9F',
  companyEmail = 'pi.parkit@gmail.com',
  
  // Email Content
  title = 'Notification',
  subtitle = '',
  message = '',
  
  // Action Button
  actionButtonText = '',
  actionButtonLink = '',
  
  // Additional Details
  bottomMessage = '',
  additionalInfo = '',
  
  // Styling Customization 
  primaryColor = '#4285F4',  // Light blue
  secondaryColor = '#000000', // Black for text
  backgroundColor = '#F5F5F5', // Light gray background
  bodyBackgroundColor = '#FFFFFF', // Background color for email body 
  
  // Social Links
  socialLinks = {
    facebook: 'https://facebook.com/yourcompany',
    whatsapp: 'https://wa.me/1234567890',
    instagram: 'https://instagram.com/yourcompany'
  },
  
  // Optional Sections
  headerImage = null,
  footerText = `© ${new Date().getFullYear()} - All Rights Reserved ${companyName}`
} = {}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - ${companyName}</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: ${backgroundColor};
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .email-header {
          background-color: white;
          color: black;
          text-align: center;
          padding: 20px;
          border-bottom: 1px solid #dddddd; /* Ajout de la ligne de séparation */
        }
        .email-header img {
          max-width: 100px;
          margin-bottom: 10px;
        }
        .email-body {
          padding: 30px;
          text-align: center;
          background-color: ${bodyBackgroundColor}; /* UTILISATION DU NOUVEAU PARAMÈTRE */
        }
        .email-action-button {
          display: inline-block;
          background-color: #000000;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .email-footer {
          background-color: #000000; /* Black footer */
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: white;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-links a {
          margin: 0 10px;
          text-decoration: none;
        }
        .social-links img {
          width: 24px;
          vertical-align: middle;
        }
        .additional-info {
          background-color: #F8F9FA;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="${companyLogo}" alt="${companyName} Logo">
          <h1>${title}</h1>
          ${subtitle ? `<h2 style="color: #000000;">${subtitle}</h2>` : ''}
        </div>
        
        ${headerImage ? `
          <div style="text-align: center; background-color: white;">
            <img src="${headerImage}" alt="Header Image" style="max-width: 100%; height: auto;">
          </div>
        ` : ''}
        
        <div class="email-body">
          ${message ? `<p style="color: ${secondaryColor};">${message}</p>` : ''}
          
          ${actionButtonLink ? `
            <a href="${actionButtonLink}" class="email-action-button">
              ${actionButtonText}
            </a>
          ` : ''}
          
          ${bottomMessage ? `
            <p style="font-size: 0.9em; color: ${secondaryColor};">
              ${bottomMessage}
            </p>
          ` : ''}
          
          ${additionalInfo ? `
            <div class="additional-info">
              ${additionalInfo}
            </div>
          ` : ''}
        </div>
        
        <div class="email-footer">
          <div class="social-links">
            ${Object.entries(socialLinks).map(([platform, link]) => {
              let iconUrl = '';
              if (platform === 'facebook') {
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/733/733547.png';
              } else if (platform === 'whatsapp') {
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/733/733585.png';
              } else if (platform === 'instagram') {
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/733/733558.png'; 
              } else {
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/732/732200.png';
              }
              return `
                <a href="${link}" target="_blank">
                  <img src="${iconUrl}" alt="${platform} Icon">
                </a>
              `;
            }).join('')}
          </div>
          
          <p>Contact us: <a href="mailto:${companyEmail}" style="color: white;">${companyEmail}</a></p>
          
          <p>${footerText}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Pour utiliser un fond de couleur différente pour l'email-body:
function generatePasswordResetEmail(resetLink) {
  return createEmailTemplate({
    title: 'Password Reset',
    subtitle: 'Secure Account Recovery',
    message: 'You have requested to reset your password. Click the button below to proceed:',
    actionButtonText: 'Reset Password',
    actionButtonLink: resetLink,
    bodyBackgroundColor: '#f0f0f0', //gris clair
    bottomMessage: 'This link will expire in 10 minutes. If you did not request this, please ignore this email.',
    additionalInfo: 'For security reasons, do not share this link with anyone.'
  });
}

function generateAccountActivationEmail(activationLink) {
  return createEmailTemplate({
    title: 'Activate Your Account',
    subtitle: 'Welcome to Parkit',
    message: 'Thank you for registering! Please activate your account by clicking the button below:',
    actionButtonText: 'Activate Account',
    actionButtonLink: activationLink,
    bodyBackgroundColor: '#f0f0f0', //  un fond gris clair
    bottomMessage: 'Your account will be active once you confirm your email.',
    additionalInfo: 'If you did not create an account, please disregard this email.'
  });
}

function generateBookingConfirmationEmail(bookingDetails) {
  return createEmailTemplate({
    title: 'Booking Confirmed',
    subtitle: 'Reservation Details',
    message: `Your booking for ${bookingDetails.parkingSpace} has been confirmed.`,
    actionButtonText: 'View Booking',
    actionButtonLink: bookingDetails.bookingLink,
    bodyBackgroundColor: '#f0f0f0', // un fond gris clair
    bottomMessage: `Booking Reference: ${bookingDetails.referenceNumber}`,
    additionalInfo: `
      <p><strong>Location:</strong> ${bookingDetails.location}</p>
      <p><strong>Date:</strong> ${bookingDetails.date}</p>
      <p><strong>Time:</strong> ${bookingDetails.time}</p>
    `
  });
}

module.exports = {
  createEmailTemplate,
  generatePasswordResetEmail,
  generateAccountActivationEmail,
  generateBookingConfirmationEmail
};