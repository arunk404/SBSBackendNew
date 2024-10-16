const nodemailer = require("nodemailer");

async function sent_Email(to, subject, message,fileName, file) {
  const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
  const EMAIL_FROM = process.env.EMAIL_FROM; 
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD; 
  const EMAIL_HOST = process.env.EMAIL_HOST; 
  const PORT = process.env.EMAIL_PORT; 
  const PROTOCOL = process.env.EMAIL_PROTOCOL; 
  var returnArray = [];

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: PORT,
    secure: PROTOCOL,
    auth: {
      user: EMAIL_FROM,
      pass: EMAIL_PASSWORD,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      
    console.log('Authentication failed1:', error);
      returnArray.push(
      {
        code: 500,
        status: 'Error',
        message: error,
      });
    } 
  });
  
  if(returnArray.length > 0){
    return returnArray;
  }else{

    transporter.on('error', (error) => {
      console.log('Authentication failed:', error);
      // Handle the error as needed
      return {
        code: 500,
        status: 'Error',
        message: error
      }
    });
    
    var mailOptions;
    if(fileName!=null)
    {
      mailOptions = {
        from:  process.env.EMAIL_FROM,
        to: [ to ],
        subject: subject,
        html: message,
        attachments: [
          {
            filename: fileName, // replace with the actual filename
            path: "views/public/"+file, // replace with the actual file path
          },
        ],
      };

    }
    else
    {
      mailOptions = {
        from:  process.env.EMAIL_FROM,
        to: [ to ],
        subject: subject,
        html: message,
      };
    }
   

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject({
            code: 500,
            status: 'Error',
            message: error
          });
        } else {
          console.log("here");
          resolve({
            code: 200,
            status: 'Successful',
            message: 'Email has been sent successfully'
          });
        }
      });
    });
  }
}





// Example of using the function with async/await
// Uncomment the line below to run the example
// exampleUsage();


module.exports = {
    sent_Email
};