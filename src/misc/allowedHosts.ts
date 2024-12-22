type AllowedHost = {
  label: string;
  domain: string;
  urlTemplate: RegExp;
};

type AllowedHosts = {
  [key: string]: AllowedHost;
};

const ALLOWED_HOSTS: AllowedHosts = {
  googleDrive: {
    label: 'Google Drive',
    domain: 'drive.google.com',
  } as AllowedHost,
  mega: {
    label: 'MEGA',
  } as AllowedHost,
  mediaFire: {
    label: 'MediaFire',
  } as AllowedHost,
  dropbox: {
    label: 'Dropbox',
  } as AllowedHost,
};

export default ALLOWED_HOSTS;
