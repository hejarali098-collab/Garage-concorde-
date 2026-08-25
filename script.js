function buildQuoteEmail(event){
  event.preventDefault();
  const f = event.target;
  const data = new FormData(f);
  const subject = `Demande de devis - ${data.get('nom') || 'Client'} - ${data.get('vehicule') || 'Véhicule'}`;
  const body = [
    'Bonjour Garage Concorde Sàrl,', '',
    'Je souhaite recevoir un devis.', '',
    `Nom: ${data.get('nom') || ''}`,
    `Téléphone: ${data.get('telephone') || ''}`,
    `E-mail: ${data.get('email') || ''}`,
    `Véhicule: ${data.get('vehicule') || ''}`,
    `Immatriculation: ${data.get('immatriculation') || ''}`,
    `Kilométrage: ${data.get('km') || ''}`,
    `Prestation: ${data.get('prestation') || ''}`,
    '', 'Description:', data.get('message') || '', '',
    'Merci de me recontacter.'
  ].join('\n');
  window.location.href = `mailto:info@garage-concorde.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('success').style.display='block';
}
