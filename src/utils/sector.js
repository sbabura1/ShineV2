export function getPrimaryRole(roles) {
  return roles.split(/\s*(?:Â·|·|•)\s*/)[0];
}
