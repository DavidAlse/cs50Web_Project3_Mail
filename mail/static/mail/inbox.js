document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //submit handler
  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#singleEmail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Function to split the first sentence of an email body
function getFirstSentence(body) {
  // Split the body text into sentences
  const sentences = body.split(/[.!?]+/);
  // Get the first sentence
  const firstSentence = sentences[0];
  return firstSentence;
}

function view_email(id) {
  //console.log(id)
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#singleEmail-view').style.display = 'block';

      document.querySelector('#singleEmail-view').innerHTML = `
    <ul class="list-group">
  <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
  <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
  <li class="list-group-item"><strong>Received:</strong> ${email.timestamp}</li>
  <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
  <li class="list-group-item" style="white-space: pre-line;">${email.body}</li>
  </ul>`

      //read or unread 
      if (!email.read) {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      //reply button
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply"
      btn_reply.className = "btn btn-warning"
      btn_reply.addEventListener('click', function () {
        compose_email()
        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject
        if(subject.split(' ', 1)[0] != "Re:"){
          subject = "Re: " + email.subject;
        }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = ` Type your reply here
      
        -------------------------------------------------
        Sent: ${email.timestamp} 
        From: ${email.sender}
        To: ${email.recipients}
        Subject: ${email.subject} \n
          ${email.body}
        -------------------------------------------------`;
        console.log(btn_reply.innerHTML)
      })
      document.querySelector('#singleEmail-view').append(btn_reply);


      //back button
      const btn_back = document.createElement('button');
      btn_back.innerHTML = "Back to Inbox"
      btn_back.className = "btn btn-primary"
      btn_back.addEventListener('click', function () {
        load_mailbox('inbox');
        console.log(btn_back.innerHTML)
      })
      document.querySelector('#singleEmail-view').append(btn_back);



      //Mark as unread button
      const btn_markAsUnread = document.createElement('button');
      btn_markAsUnread.innerHTML = "Mark as Unread"
      btn_markAsUnread.className = "btn btn-primary"
      btn_markAsUnread.addEventListener('click', function () {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: false
          })
        })
        console.log(btn_markAsUnread.innerHTML)
      })
      document.querySelector('#singleEmail-view').append(btn_markAsUnread);

      //archive button
      const btn_archive = document.createElement('button');
      btn_archive.innerHTML = email.archived ? "Unarchive" : "Archive"
      btn_archive.className = email.archived ? "btn btn-info" : "btn btn-warning"
      btn_archive.addEventListener('click', function () {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .then(() => { load_mailbox('archive')})
        console.log(btn_archive.innerHTML)
      })
      document.querySelector('#singleEmail-view').append(btn_archive);
    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#singleEmail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get mailbox info 
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      //loop thru emails and make new div
      emails.forEach(email => {
        console.log(email)

        //create new div for each
        const newEmail = document.createElement('div');
        
        const firstSentence = getFirstSentence(email.body);

        newEmail.innerHTML = `
    <h6>Received: ${email.timestamp}</h6>
    <h5>Sender: ${email.sender}</h5>
    <h5>Subject: ${email.subject}</h5>
    <p>${firstSentence}</p>
    `;
        newEmail.className = email.read ? 'list-group-item list-group-item-action list-group-item-light' : 'list-group-item list-group-item-action list-group-item-primary';
        newEmail.addEventListener('click', function () {
          console.log('click!')
          view_email(email.id)
        });
        document.querySelector('#emails-view').append(newEmail);
      })
    });
}

function send_email(event) {
  event.preventDefault();

  //store fields
  const emailRecipients = document.querySelector('#compose-recipients').value;
  const emailSubject = document.querySelector('#compose-subject').value;
  const emailBody = document.querySelector('#compose-body').value

  console.log('hi')

  //send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: emailRecipients,
      subject: emailSubject,
      body: emailBody
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
    });
}



