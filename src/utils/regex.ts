const NUMBER_REGEX = /^[0-9]+$/;
const DATE_REGEX = /(19|20)\d{2}\-(0[1-9]|1[1,2])\-(0[1-9]|[12][0-9]|3[01])/;
const USERNAME_REGEX = /^[a-zA-Z0-9]*$/;
const PHONE_REGEX = /^\+?[1-9][0-9]{7,14}$/;

export { NUMBER_REGEX, DATE_REGEX, USERNAME_REGEX, PHONE_REGEX };
