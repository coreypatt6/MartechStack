console.log('Updating vendor logos to use transparent PNG files...');

const currentVendors = JSON.parse(localStorage.getItem('martech-vendors') || '[]');
console.log('Current vendors:', currentVendors.length);

if (currentVendors.length === 0) {
  console.log('No vendors found in localStorage');
} else {
  console.log('Current vendor names and logos:');
  currentVendors.forEach(v => console.log(' -', v.name, ':', v.logo));
  
  let updatedCount = 0;
  const updatedVendors = currentVendors.map(vendor => {
    const oldLogo = vendor.logo;
    
    if (oldLogo && !oldLogo.includes('transparent')) {
      if (oldLogo.includes('salesforce') || vendor.name.toLowerCase().includes('salesforce')) {
        vendor.logo = '/logos/salesforce-cdp-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('adobe') || vendor.name.toLowerCase().includes('adobe')) {
        if (vendor.name.toLowerCase().includes('analytics')) {
          vendor.logo = '/logos/adobe-analytics-transparent.png';
        } else {
          vendor.logo = '/logos/adobe-experience-platform-transparent.png';
        }
        updatedCount++;
      } else if (oldLogo.includes('segment') || vendor.name.toLowerCase().includes('segment')) {
        vendor.logo = '/logos/segment-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('tealium') || vendor.name.toLowerCase().includes('tealium')) {
        vendor.logo = '/logos/tealium-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('mailchimp') || vendor.name.toLowerCase().includes('mailchimp')) {
        vendor.logo = '/logos/mailchimp-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('sendgrid') || vendor.name.toLowerCase().includes('sendgrid')) {
        vendor.logo = '/logos/sendgrid-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('klaviyo') || vendor.name.toLowerCase().includes('klaviyo')) {
        vendor.logo = '/logos/klaviyo-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('twilio') || vendor.name.toLowerCase().includes('twilio')) {
        vendor.logo = '/logos/twilio-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('braze') || vendor.name.toLowerCase().includes('braze')) {
        vendor.logo = '/logos/braze-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('zendesk') || vendor.name.toLowerCase().includes('zendesk')) {
        vendor.logo = '/logos/zendesk-transparent.png';
        updatedCount++;
      } else if (oldLogo.includes('intercom') || vendor.name.toLowerCase().includes('intercom')) {
        vendor.logo = '/logos/intercom-transparent.png';
        updatedCount++;
      }
      
      if (vendor.logo !== oldLogo) {
        console.log('Updated', vendor.name, 'from', oldLogo, 'to', vendor.logo);
      }
    }
    
    return vendor;
  });
  
  localStorage.setItem('martech-vendors', JSON.stringify(updatedVendors));
  console.log('Updated', updatedCount, 'vendor logos in localStorage');
  
  if (updatedCount > 0) {
    console.log('Refreshing page to show transparent logos...');
    window.location.reload();
  } else {
    console.log('No logos were updated. They may already be using transparent versions.');
  }
}