const table = require('datasets-us-states-names-abbr');

function getAbbreviation(state) {
  const capitalize = word => word[0].toUpperCase() + word.substring(1);
  const isLast = (index, myThis) => index === myThis.length - 1;

  // Ensure the first letter of each word comprising a state name is capitalized...
  const parts = state.split(' ');
  const formattedState = parts.reduce((tempState, part, index) => {
    if (!isLast(index, parts)) {
      return `${tempState}${capitalize(part)} `;
    }
    return `${tempState}${capitalize(part)}`;
  }, '');

  // Get the state abbreviation:
  const abbreviation = table[formattedState];

  // Ensure a valid state name was provided...
  if (abbreviation === undefined) {
    throw new Error(`Unrecognized state name. Value: \`${formattedState}\`.`);
  }
  return abbreviation;
}

module.exports = getAbbreviation;
