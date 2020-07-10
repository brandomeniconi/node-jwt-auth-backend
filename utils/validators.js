
function validateEmail (email) {
  var emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email || email.length > 256 || !emailRegex.test(email)) return false;

  var [account, address] = email.split('@');
  if (account.length > 64) return false;

  var domainParts = address.split('.');
  if (domainParts.some(part => part.length > 63)) {
    return false;
  }

  return true;
}

module.exports = {
  validateEmail
};
