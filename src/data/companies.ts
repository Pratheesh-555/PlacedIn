export interface Company {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

// Alternative: Use a placeholder service
const getPlaceholderLogo = (companyName: string) => {
  const initial = companyName.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=2563eb&color=ffffff&size=100&font-size=0.6`;
};

export const companies: Company[] = [
  {
    id: 'abco',
    name: 'ABCO',
    logo: getPlaceholderLogo('ABCO'),
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logo: 'https://logo.clearbit.com/accenture.com',
    website: 'https://accenture.com'
  },
  {
    id: 'adobe',
    name: 'Adobe',
    logo: 'https://logo.clearbit.com/adobe.com',
    website: 'https://adobe.com'
  },
  {
    id: 'airtel',
    name: 'Airtel',
    logo: 'https://logo.clearbit.com/airtel.in',
    website: 'https://airtel.in'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://logo.clearbit.com/amazon.com',
    website: 'https://amazon.com'
  },
  {
    id: 'ametek',
    name: 'Ametek',
    logo: 'https://logo.clearbit.com/ametek.com',
    website: 'https://ametek.com'
  },
  {
    id: 'asian-paints',
    name: 'Asian Paints',
    logo: 'https://logo.clearbit.com/asianpaints.com',
    website: 'https://asianpaints.com'
  },
  {
    id: 'ashok-leyland',
    name: 'Ashok Leyland',
    logo: 'https://logo.clearbit.com/ashokleyland.com',
    website: 'https://ashokleyland.com'
  },
  {
    id: 'aspire-systems',
    name: 'Aspire Systems',
    logo: 'https://logo.clearbit.com/aspiresys.com',
    website: 'https://aspiresys.com'
  },
  {
    id: 'astra-zeneca',
    name: 'Astra Zeneca',
    logo: 'https://logo.clearbit.com/astrazeneca.com',
    website: 'https://astrazeneca.com'
  },
  {
    id: 'axis-bank',
    name: 'Axis Bank',
    logo: 'https://logo.clearbit.com/axisbank.com',
    website: 'https://axisbank.com'
  },
  {
    id: 'bajaj',
    name: 'Bajaj',
    logo: 'https://logo.clearbit.com/bajaj.com',
    website: 'https://bajaj.com'
  },
  {
    id: 'berger-paints',
    name: 'Berger Paints',
    logo: 'https://logo.clearbit.com/bergerpaints.com',
    website: 'https://bergerpaints.com'
  },
  {
    id: 'blue-star',
    name: 'Blue Star',
    logo: 'https://logo.clearbit.com/bluestarindia.com',
    website: 'https://bluestarindia.com'
  },
  {
    id: 'bosch',
    name: 'Bosch',
    logo: 'https://logo.clearbit.com/bosch.com',
    website: 'https://bosch.com'
  },
  {
    id: 'brakes-india',
    name: 'Brakes India',
    logo: getPlaceholderLogo('Brakes India'),
  },
  {
    id: 'bridge-i2i',
    name: 'Bridge i2i',
    logo: getPlaceholderLogo('Bridge i2i'),
  },
  {
    id: 'byjus',
    name: 'Byjus',
    logo: 'https://logo.clearbit.com/byjus.com',
    website: 'https://byjus.com'
  },
  {
    id: 'cams',
    name: 'CAMS',
    logo: 'https://logo.clearbit.com/camsonline.com',
    website: 'https://camsonline.com'
  },
  {
    id: 'caterpillar',
    name: 'Caterpillar',
    logo: 'https://logo.clearbit.com/caterpillar.com',
    website: 'https://caterpillar.com'
  },
  {
    id: 'cdd-society',
    name: 'CDD Society',
    logo: getPlaceholderLogo('CDD Society'),
  },
  {
    id: 'chargebee',
    name: 'Chargebee',
    logo: 'https://logo.clearbit.com/chargebee.com',
    website: 'https://chargebee.com'
  },
  {
    id: 'cisco',
    name: 'Cisco',
    logo: 'https://logo.clearbit.com/cisco.com',
    website: 'https://cisco.com'
  },
  {
    id: 'city-union-bank',
    name: 'City Union Bank',
    logo: 'https://logo.clearbit.com/cityunionbank.com',
    website: 'https://cityunionbank.com'
  },
  {
    id: 'cobra-legal-solutions',
    name: 'Cobra Legal Solutions',
    logo: getPlaceholderLogo('Cobra Legal Solutions'),
  },
  {
    id: 'coda-global',
    name: 'Coda Global',
    logo: getPlaceholderLogo('Coda Global'),
  },
  {
    id: 'codenation',
    name: 'Codenation',
    logo: getPlaceholderLogo('Codenation'),
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    logo: 'https://logo.clearbit.com/cognizant.com',
    website: 'https://cognizant.com'
  },
  {
    id: 'colive',
    name: 'Colive',
    logo: 'https://logo.clearbit.com/colive.com',
    website: 'https://colive.com'
  },
  {
    id: 'comcast',
    name: 'Comcast',
    logo: 'https://logo.clearbit.com/comcast.com',
    website: 'https://comcast.com'
  },
  {
    id: 'coreel',
    name: 'Coreel',
    logo: getPlaceholderLogo('Coreel'),
  },
  {
    id: 'cumi-murugappa-group',
    name: 'CUMI - Murugappa Group',
    logo: getPlaceholderLogo('CUMI'),
  },
  {
    id: 'cypress',
    name: 'Cypress',
    logo: 'https://logo.clearbit.com/cypress.com',
    website: 'https://cypress.com'
  },
  {
    id: 'dalmia-cements',
    name: 'Dalmia Cements',
    logo: 'https://logo.clearbit.com/dalmiacement.com',
    website: 'https://dalmiacement.com'
  },
  {
    id: 'data-patterns',
    name: 'Data Patterns',
    logo: getPlaceholderLogo('Data Patterns'),
  },
  {
    id: 'dell',
    name: 'Dell',
    logo: 'https://logo.clearbit.com/dell.com',
    website: 'https://dell.com'
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    logo: 'https://logo.clearbit.com/deloitte.com',
    website: 'https://deloitte.com'
  },
  {
    id: 'daimler',
    name: 'Daimler',
    logo: 'https://logo.clearbit.com/daimler.com',
    website: 'https://daimler.com'
  },
  {
    id: 'direct-i',
    name: 'Direct I',
    logo: getPlaceholderLogo('Direct I'),
  },
  {
    id: 'dr-reddys',
    name: 'Dr Reddys',
    logo: 'https://logo.clearbit.com/drreddys.com',
    website: 'https://drreddys.com'
  },
  {
    id: 'ducenit',
    name: 'DucenIT',
    logo: getPlaceholderLogo('DucenIT'),
  },
  {
    id: 'dulux-paints',
    name: 'Dulux Paints',
    logo: 'https://logo.clearbit.com/dulux.com',
    website: 'https://dulux.com'
  },
  {
    id: 'ey',
    name: 'E&Y',
    logo: 'https://logo.clearbit.com/ey.com',
    website: 'https://ey.com'
  },
  {
    id: 'elgi',
    name: 'ELGI',
    logo: 'https://logo.clearbit.com/elgi.com',
    website: 'https://elgi.com'
  },
  {
    id: 'embed-ur',
    name: 'Embed UR',
    logo: getPlaceholderLogo('Embed UR'),
  },
  {
    id: 'ericsson',
    name: 'Ericsson',
    logo: 'https://logo.clearbit.com/ericsson.com',
    website: 'https://ericsson.com'
  },
  {
    id: 'eurocon',
    name: 'Eurocon',
    logo: getPlaceholderLogo('Eurocon'),
  },
  {
    id: 'eze-software',
    name: 'Eze Software',
    logo: getPlaceholderLogo('Eze Software'),
  },
  {
    id: 'face',
    name: 'FACE',
    logo: getPlaceholderLogo('FACE'),
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    logo: 'https://logo.clearbit.com/fidelity.com',
    website: 'https://fidelity.com'
  },
  {
    id: 'first-naukri',
    name: 'First Naukri',
    logo: getPlaceholderLogo('First Naukri'),
  },
  {
    id: 'ford',
    name: 'Ford',
    logo: 'https://logo.clearbit.com/ford.com',
    website: 'https://ford.com'
  },
  {
    id: 'forge',
    name: 'Forge',
    logo: getPlaceholderLogo('Forge'),
  },
  {
    id: 'freshworks',
    name: 'Freshworks',
    logo: 'https://logo.clearbit.com/freshworks.com',
    website: 'https://freshworks.com'
  },
  {
    id: 'fss',
    name: 'FSS',
    logo: getPlaceholderLogo('FSS'),
  },
  {
    id: 'gamesa',
    name: 'Gamesa',
    logo: 'https://logo.clearbit.com/siemensgamesa.com',
    website: 'https://siemensgamesa.com'
  },
  {
    id: 'ge-appliances',
    name: 'GE Appliances',
    logo: 'https://logo.clearbit.com/geappliances.com',
    website: 'https://geappliances.com'
  },
  {
    id: 'genesys',
    name: 'Genesys',
    logo: 'https://logo.clearbit.com/genesys.com',
    website: 'https://genesys.com'
  },
  {
    id: 'gofrugal',
    name: 'Gofrugal',
    logo: 'https://logo.clearbit.com/gofrugal.com',
    website: 'https://gofrugal.com'
  },
  {
    id: 'gre-edge',
    name: 'GRE Edge',
    logo: getPlaceholderLogo('GRE Edge'),
  },
  {
    id: 'happiest-minds',
    name: 'Happiest Minds',
    logo: 'https://logo.clearbit.com/happiestminds.com',
    website: 'https://happiestminds.com'
  },
  {
    id: 'hdb-financial-services',
    name: 'HDB Financial Services',
    logo: 'https://logo.clearbit.com/hdbfs.com',
    website: 'https://hdbfs.com'
  },
  {
    id: 'hdfc',
    name: 'HDFC',
    logo: 'https://logo.clearbit.com/hdfc.com',
    website: 'https://hdfc.com'
  },
  {
    id: 'honda-rd',
    name: 'Honda R&D',
    logo: 'https://logo.clearbit.com/honda.com',
    website: 'https://honda.com'
  },
  {
    id: 'honeywell',
    name: 'Honeywell',
    logo: 'https://logo.clearbit.com/honeywell.com',
    website: 'https://honeywell.com'
  },
  {
    id: 'hsbc-bank',
    name: 'HSBC Bank',
    logo: 'https://logo.clearbit.com/hsbc.com',
    website: 'https://hsbc.com'
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    logo: 'https://logo.clearbit.com/hyundai.com',
    website: 'https://hyundai.com'
  },
  {
    id: 'ibm',
    name: 'IBM',
    logo: 'https://logo.clearbit.com/ibm.com',
    website: 'https://ibm.com'
  },
  {
    id: 'icici-prudential',
    name: 'ICICI Prudential',
    logo: 'https://logo.clearbit.com/iciciprulife.com',
    website: 'https://iciciprulife.com'
  },
  {
    id: 'icici-securities',
    name: 'ICICI Securities',
    logo: 'https://logo.clearbit.com/icicidirect.com',
    website: 'https://icicidirect.com'
  },
  {
    id: 'idbi-federal',
    name: 'IDBI Federal',
    logo: 'https://logo.clearbit.com/idbifederal.com',
    website: 'https://idbifederal.com'
  },
  {
    id: 'iet',
    name: 'IET',
    logo: getPlaceholderLogo('IET'),
  },
  {
    id: 'ilink',
    name: 'Ilink',
    logo: getPlaceholderLogo('Ilink'),
  },
  {
    id: 'inautix',
    name: 'Inautix',
    logo: getPlaceholderLogo('Inautix'),
  },
  {
    id: 'informatica',
    name: 'Informatica',
    logo: 'https://logo.clearbit.com/informatica.com',
    website: 'https://informatica.com'
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: 'https://logo.clearbit.com/infosys.com',
    website: 'https://infosys.com'
  },
  {
    id: 'infotrellis',
    name: 'Infotrellis',
    logo: getPlaceholderLogo('Infotrellis'),
  },
  {
    id: 'integrated-enterprises',
    name: 'Integrated Enterprises',
    logo: getPlaceholderLogo('Integrated Enterprises'),
  },
  {
    id: 'interface-design',
    name: 'Interface Design',
    logo: getPlaceholderLogo('Interface Design'),
  },
  {
    id: 'itc-group',
    name: 'ITC Group',
    logo: 'https://logo.clearbit.com/itcportal.com',
    website: 'https://itcportal.com'
  },
  {
    id: 'jasmine-infotech',
    name: 'Jasmine Infotech',
    logo: getPlaceholderLogo('Jasmine Infotech'),
  },
  {
    id: 'juspay',
    name: 'Juspay',
    logo: 'https://logo.clearbit.com/juspay.in',
    website: 'https://juspay.in'
  },
  {
    id: 'kaleeswari-group',
    name: 'Kaleeswari Group',
    logo: getPlaceholderLogo('Kaleeswari Group'),
  },
  {
    id: 'kaspon-technologies',
    name: 'Kaspon Technologies',
    logo: getPlaceholderLogo('Kaspon Technologies'),
  },
  {
    id: 'kelloggs',
    name: 'Kellogg\'s',
    logo: 'https://logo.clearbit.com/kelloggs.com',
    website: 'https://kelloggs.com'
  },
  {
    id: 'kla-tencor',
    name: 'KLA Tencor',
    logo: 'https://logo.clearbit.com/kla.com',
    website: 'https://kla.com'
  },
  {
    id: 'kpit',
    name: 'KPIT',
    logo: 'https://logo.clearbit.com/kpit.com',
    website: 'https://kpit.com'
  },
  {
    id: 'lt',
    name: 'L&T',
    logo: 'https://logo.clearbit.com/larsentoubro.com',
    website: 'https://larsentoubro.com'
  },
  {
    id: 'lt-infotech',
    name: 'L&T Infotech',
    logo: 'https://logo.clearbit.com/lntinfotech.com',
    website: 'https://lntinfotech.com'
  },
  {
    id: 'lt-infra',
    name: 'L&T Infra',
    logo: getPlaceholderLogo('L&T Infra'),
  },
  {
    id: 'lt-technical',
    name: 'L&T Technical',
    logo: getPlaceholderLogo('L&T Technical'),
  },
  {
    id: 'latent-view',
    name: 'Latent View',
    logo: 'https://logo.clearbit.com/latentview.com',
    website: 'https://latentview.com'
  },
  {
    id: 'lexqual',
    name: 'Lexqual',
    logo: getPlaceholderLogo('Lexqual'),
  },
  {
    id: 'lister-tech',
    name: 'Lister Tech',
    logo: getPlaceholderLogo('Lister Tech'),
  },
  {
    id: 'logic-info',
    name: 'Logic Info',
    logo: getPlaceholderLogo('Logic Info'),
  },
  {
    id: 'lucas-tvs',
    name: 'Lucas TVS',
    logo: getPlaceholderLogo('Lucas TVS'),
  },
  {
    id: 'luk-india',
    name: 'Luk India',
    logo: getPlaceholderLogo('Luk India'),
  },
  {
    id: 'manali-petro',
    name: 'Manali Petro',
    logo: getPlaceholderLogo('Manali Petro'),
  },
  {
    id: 'mckinsey',
    name: 'McKinsey',
    logo: 'https://logo.clearbit.com/mckinsey.com',
    website: 'https://mckinsey.com'
  },
  {
    id: 'microchip',
    name: 'Microchip',
    logo: 'https://logo.clearbit.com/microchip.com',
    website: 'https://microchip.com'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    website: 'https://microsoft.com'
  },
  {
    id: 'mindgate',
    name: 'Mindgate',
    logo: getPlaceholderLogo('Mindgate'),
  },
  {
    id: 'mindtree',
    name: 'Mindtree',
    logo: 'https://logo.clearbit.com/mindtree.com',
    website: 'https://mindtree.com'
  },
  {
    id: 'morgan-stanley',
    name: 'Morgan Stanley',
    logo: 'https://logo.clearbit.com/morganstanley.com',
    website: 'https://morganstanley.com'
  },
  {
    id: 'mphasis',
    name: 'Mphasis',
    logo: 'https://logo.clearbit.com/mphasis.com',
    website: 'https://mphasis.com'
  },
  {
    id: 'mu-sigma',
    name: 'Mu Sigma',
    logo: 'https://logo.clearbit.com/mu-sigma.com',
    website: 'https://mu-sigma.com'
  },
  {
    id: 'muthoot',
    name: 'Muthoot',
    logo: 'https://logo.clearbit.com/muthoot.com',
    website: 'https://muthoot.com'
  },
  {
    id: 'navis',
    name: 'Navis',
    logo: getPlaceholderLogo('Navis'),
  },
  {
    id: 'ndot',
    name: 'NDOT',
    logo: getPlaceholderLogo('NDOT'),
  },
  {
    id: 'nestle',
    name: 'Nestle',
    logo: 'https://logo.clearbit.com/nestle.com',
    website: 'https://nestle.com'
  },
  {
    id: 'neway',
    name: 'Neway',
    logo: getPlaceholderLogo('Neway'),
  },
  {
    id: 'newgen',
    name: 'Newgen',
    logo: 'https://logo.clearbit.com/newgensoft.com',
    website: 'https://newgensoft.com'
  },
  {
    id: 'ninjacart',
    name: 'Ninjacart',
    logo: 'https://logo.clearbit.com/ninjacart.in',
    website: 'https://ninjacart.in'
  },
  {
    id: 'nokia',
    name: 'Nokia',
    logo: 'https://logo.clearbit.com/nokia.com',
    website: 'https://nokia.com'
  },
  {
    id: 'novozyme',
    name: 'Novozyme',
    logo: 'https://logo.clearbit.com/novozymes.com',
    website: 'https://novozymes.com'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    logo: 'https://logo.clearbit.com/oracle.com',
    website: 'https://oracle.com'
  },
  {
    id: 'orange-scape',
    name: 'Orange Scape',
    logo: getPlaceholderLogo('Orange Scape'),
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://logo.clearbit.com/paypal.com',
    website: 'https://paypal.com'
  },
  {
    id: 'pipe-candy',
    name: 'Pipe Candy',
    logo: getPlaceholderLogo('Pipe Candy'),
  },
  {
    id: 'presidio',
    name: 'Presidio',
    logo: 'https://logo.clearbit.com/presidio.com',
    website: 'https://presidio.com'
  },
  {
    id: 'public-sapient',
    name: 'Public Sapient',
    logo: 'https://logo.clearbit.com/publicissapient.com',
    website: 'https://publicissapient.com'
  },
  {
    id: 'pwc',
    name: 'PWC',
    logo: 'https://logo.clearbit.com/pwc.com',
    website: 'https://pwc.com'
  },
  {
    id: 'ramco',
    name: 'Ramco',
    logo: 'https://logo.clearbit.com/ramco.com',
    website: 'https://ramco.com'
  },
  {
    id: 'rane',
    name: 'Rane',
    logo: 'https://logo.clearbit.com/rane.co.in',
    website: 'https://rane.co.in'
  },
  {
    id: 'reliance',
    name: 'Reliance',
    logo: 'https://logo.clearbit.com/ril.com',
    website: 'https://ril.com'
  },
  {
    id: 'renault',
    name: 'Renault',
    logo: 'https://logo.clearbit.com/renault.com',
    website: 'https://renault.com'
  },
  {
    id: 'rently',
    name: 'Rently',
    logo: getPlaceholderLogo('Rently'),
  },
  {
    id: 'rockwell',
    name: 'Rockwell',
    logo: 'https://logo.clearbit.com/rockwellautomation.com',
    website: 'https://rockwellautomation.com'
  },
  {
    id: 'saint-gobain',
    name: 'Saint Gobain',
    logo: 'https://logo.clearbit.com/saint-gobain.com',
    website: 'https://saint-gobain.com'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: 'https://logo.clearbit.com/salesforce.com',
    website: 'https://salesforce.com'
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logo: 'https://logo.clearbit.com/samsung.com',
    website: 'https://samsung.com'
  },
  {
    id: 'sanmar',
    name: 'Sanmar',
    logo: getPlaceholderLogo('Sanmar'),
  },
  {
    id: 'scope',
    name: 'Scope',
    logo: getPlaceholderLogo('Scope'),
  },
  {
    id: 'sify',
    name: 'Sify',
    logo: 'https://logo.clearbit.com/sify.com',
    website: 'https://sify.com'
  },
  {
    id: 'sirius',
    name: 'Sirius',
    logo: getPlaceholderLogo('Sirius'),
  },
  {
    id: 'societe-generale',
    name: 'Societe Generale',
    logo: 'https://logo.clearbit.com/societegenerale.com',
    website: 'https://societegenerale.com'
  },
  {
    id: 'spb',
    name: 'SPB',
    logo: getPlaceholderLogo('SPB'),
  },
  {
    id: 'sundaram-clayton',
    name: 'Sundaram Clayton',
    logo: getPlaceholderLogo('Sundaram Clayton'),
  },
  {
    id: 'super-gas',
    name: 'Super Gas',
    logo: getPlaceholderLogo('Super Gas'),
  },
  {
    id: 'sutherland',
    name: 'Sutherland',
    logo: 'https://logo.clearbit.com/sutherlandglobal.com',
    website: 'https://sutherlandglobal.com'
  },
  {
    id: 'swymcorp',
    name: 'SWYMcorp',
    logo: getPlaceholderLogo('SWYMcorp'),
  },
  {
    id: 'symantec',
    name: 'Symantec',
    logo: 'https://logo.clearbit.com/broadcom.com',
    website: 'https://broadcom.com'
  },
  {
    id: 'sysbiz',
    name: 'Sysbiz',
    logo: getPlaceholderLogo('Sysbiz'),
  },
  {
    id: 'system-insights',
    name: 'System Insights',
    logo: getPlaceholderLogo('System Insights'),
  },
  {
    id: 'tafe',
    name: 'TAFE',
    logo: 'https://logo.clearbit.com/tafe.com',
    website: 'https://tafe.com'
  },
  {
    id: 'tata-communication',
    name: 'TATA Communication',
    logo: 'https://logo.clearbit.com/tatacommunications.com',
    website: 'https://tatacommunications.com'
  },
  {
    id: 'tata-elxsi',
    name: 'Tata Elxsi',
    logo: 'https://logo.clearbit.com/tataelxsi.com',
    website: 'https://tataelxsi.com'
  },
  {
    id: 'tcs',
    name: 'TCS',
    logo: 'https://logo.clearbit.com/tcs.com',
    website: 'https://tcs.com'
  },
  {
    id: 'teach-for-india',
    name: 'Teach for India',
    logo: 'https://logo.clearbit.com/teachforindia.org',
    website: 'https://teachforindia.org'
  },
  {
    id: 'tech-mahindra',
    name: 'Tech Mahindra',
    logo: 'https://logo.clearbit.com/techmahindra.com',
    website: 'https://techmahindra.com'
  },
  {
    id: 'technicolour',
    name: 'Technicolour',
    logo: 'https://logo.clearbit.com/technicolor.com',
    website: 'https://technicolor.com'
  },
  {
    id: 'temenos',
    name: 'Temenos',
    logo: 'https://logo.clearbit.com/temenos.com',
    website: 'https://temenos.com'
  },
  {
    id: 'tessolve',
    name: 'Tessolve',
    logo: 'https://logo.clearbit.com/tessolve.com',
    website: 'https://tessolve.com'
  },
  {
    id: 'thamarai-school',
    name: 'Thamarai School',
    logo: getPlaceholderLogo('Thamarai School'),
  },
  {
    id: 'thirumalai',
    name: 'Thirumalai',
    logo: getPlaceholderLogo('Thirumalai'),
  },
  {
    id: 'titan',
    name: 'Titan',
    logo: 'https://logo.clearbit.com/titan.co.in',
    website: 'https://titan.co.in'
  },
  {
    id: 'transcars',
    name: 'Transcars',
    logo: getPlaceholderLogo('Transcars'),
  },
  {
    id: 'turbo-energy',
    name: 'Turbo Energy',
    logo: getPlaceholderLogo('Turbo Energy'),
  },
  {
    id: 'tvs-motors',
    name: 'TVS Motors',
    logo: 'https://logo.clearbit.com/tvsmotor.com',
    website: 'https://tvsmotor.com'
  },
  {
    id: 'tvs-sons',
    name: 'TVS Sons',
    logo: getPlaceholderLogo('TVS Sons'),
  },
  {
    id: 'tynor',
    name: 'Tynor',
    logo: getPlaceholderLogo('Tynor'),
  },
  {
    id: 'valeo',
    name: 'Valeo',
    logo: 'https://logo.clearbit.com/valeo.com',
    website: 'https://valeo.com'
  },
  {
    id: 'value-labs',
    name: 'Value Labs',
    logo: 'https://logo.clearbit.com/valuelabs.com',
    website: 'https://valuelabs.com'
  },
  {
    id: 'verizon',
    name: 'Verizon',
    logo: 'https://logo.clearbit.com/verizon.com',
    website: 'https://verizon.com'
  },
  {
    id: 'viasat',
    name: 'Viasat',
    logo: 'https://logo.clearbit.com/viasat.com',
    website: 'https://viasat.com'
  },
  {
    id: 'virtusa',
    name: 'Virtusa',
    logo: 'https://logo.clearbit.com/virtusa.com',
    website: 'https://virtusa.com'
  },
  {
    id: 'visual-bi',
    name: 'Visual BI',
    logo: getPlaceholderLogo('Visual BI'),
  },
  {
    id: 'vmware',
    name: 'VMware',
    logo: 'https://logo.clearbit.com/vmware.com',
    website: 'https://vmware.com'
  },
  {
    id: 'vurum',
    name: 'Vurum',
    logo: getPlaceholderLogo('Vurum'),
  },
  {
    id: 'walmart',
    name: 'Walmart',
    logo: 'https://logo.clearbit.com/walmart.com',
    website: 'https://walmart.com'
  },
  {
    id: 'wells-fargo',
    name: 'Wells Fargo',
    logo: 'https://logo.clearbit.com/wellsfargo.com',
    website: 'https://wellsfargo.com'
  },
  {
    id: 'wipro-tech',
    name: 'Wipro Tech',
    logo: 'https://logo.clearbit.com/wipro.com',
    website: 'https://wipro.com'
  },
  {
    id: 'zifo',
    name: 'Zifo',
    logo: 'https://logo.clearbit.com/zifornd.com',
    website: 'https://zifornd.com'
  },
  {
    id: 'zifo-rnd',
    name: 'Zifo R&D',
    logo: 'https://logo.clearbit.com/zifornd.com',
    website: 'https://zifornd.com'
  },
  {
    id: 'zoho',
    name: 'ZOHO',
    logo: 'https://logo.clearbit.com/zoho.com',
    website: 'https://zoho.com'
  },
  {
    id: 'zoom-rx',
    name: 'Zoom Rx',
    logo: 'https://logo.clearbit.com/zoomrx.com',
    website: 'https://zoomrx.com'
  },
  {
    id: 'zs-associates',
    name: 'ZS Associates',
    logo: 'https://logo.clearbit.com/zs.com',
    website: 'https://zs.com'
  }
];

// Helper function to get company names for dropdowns
export const getCompanyNames = (): string[] => {
  return companies.map(company => company.name).sort();
};

// Helper function to find company by name
export const findCompanyByName = (name: string): Company | undefined => {
  return companies.find(company => 
    company.name.toLowerCase() === name.toLowerCase()
  );
};